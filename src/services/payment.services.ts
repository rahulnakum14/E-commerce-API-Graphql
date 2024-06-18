import { ApolloError } from "apollo-server-errors";
import { PaymentMessage, ProductMessage } from "../utills/constants";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import CartModel from "../models/cartModel";
import ProductModel from "../models/productModel";
import UserModel from "../models/userModel";
import PDFDocument from "pdfkit";
import { sendEmail } from "../helper/mailServices";
import { ObjectId } from "mongodb";
import {
  CartError,
  ProductError,
  StripeKeyError,
  UserExistsError,
  ValidationError,
} from "../utills/custom_error";

class PaymentServices {
  async getPaymentUrl(userID: string): Promise<{
    message: string;
    PaymentUrl: string;
    SessionId: string;
    InvoiceId: string;
  }> {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new StripeKeyError(PaymentMessage.StripeKeyError);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-04-10",
    });

    const cart = await CartModel.findOne({ cart_user: userID });

    if (!cart || cart.products.length === 0) {
      throw new CartError(PaymentMessage.CartNotFound);
    }

    const productIds = cart.products.map(
      (product) => new ObjectId(product.product_id)
    );

    const productDetails = await ProductModel.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      productDetails.map((product) => [
        (product._id as ObjectId).toString(),
        product,
      ])
    );

    const lineItems = cart.products.map((product) => {
      const productDetail = productMap.get(product.product_id);

      if (!productDetail) {
        throw new ProductError(
          `${ProductMessage.NotFound} - ${product.product_id}`
        );
      }

      const unitAmount = Number(productDetail.product_price) * 100;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: productDetail.product_name,
          },
          unit_amount: unitAmount,
        },
        quantity: product.quantity,
      };
    });

    const user = await UserModel.findById(userID);

    if (!user) {
      throw new UserExistsError(`User with ID ${userID} not found`);
    }

    const customer = await stripe.customers.create({
      name: user.username,
    });

    const invoice = await stripe.invoices.create({
      customer: customer.id,
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.BASE_URL}order/order-placed-successfully`,
      cancel_url: `${process.env.BASE_URL}order/error-in-payment`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "NZ", "SG", "JP"],
      },
    });

    return {
      message: "Click on URL to pay!",
      PaymentUrl: session.url!,
      SessionId: session.id,
      InvoiceId: invoice.id,
    };
  }

  async orderSuccess(userID: string): Promise<string> {
    const user = await UserModel.findById(userID);
    const cart = await CartModel.findOne({ cart_user: userID }).populate(
      "products"
    );

    if (!user || !cart) {
      throw new ValidationError(PaymentMessage.UserCartNotFound);
    }

    const invoiceDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir);
    }

    const pdfPath = path.join(invoiceDir, `invoice_${userID}.pdf`);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(pdfPath);

    return new Promise<string>((resolve, reject) => {
      writeStream.on("finish", async () => {
        console.log("PDF stream finished writing");

        try {
          const emailContent = `
              <h1>Order Placed Successfully</h1>
              <p>Dear ${user.username},</p>
              <p>Thank you for your order. Please find the attached invoice for your purchase.</p>
            `;
          await sendEmail(
            user.email,
            "Your Order Invoice",
            emailContent,
            pdfPath
          );
          fs.unlinkSync(pdfPath);

          resolve(
            `${PaymentMessage.OrderSuccess} and invoice sent to your email`
          );
        } catch (emailError) {
          reject(new Error(PaymentMessage.EmailSendingError));
        }
      });

      writeStream.on("error", (streamError) => {
        console.error(PaymentMessage.PDFStreamError, streamError);
        reject(new Error(PaymentMessage.PDFStreamError));
      });

      // Pipe the PDF document to the write stream
      doc.pipe(writeStream);
      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Customer: ${user.username}`);
      doc.text(`Email: ${user.email}`);
      doc.moveDown();

      doc.fontSize(14).text("Product", 50, doc.y, { continued: true });
      doc.text("Quantity", 300, doc.y, { continued: true });
      doc.text("Price", 400, doc.y);
      doc.moveDown();

      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      const productPromises = cart.products.map(async (product) => {
        const productDetails = await ProductModel.findById(product.product_id);
        if (!productDetails) {
          return null;
        }

        return {
          name: productDetails.product_name,
          quantity: product.quantity,
          price: product.price,
        };
      });

      Promise.all(productPromises)
        .then((products) => {
          products.forEach((product) => {
            if (product) {
              doc.fontSize(12).text(product.name, 50, doc.y);
              doc.text(product.quantity.toString(), 350, doc.y);
              doc.text(`$${product.price.toFixed(2)}`, 500, doc.y);
              doc.moveDown();
            }
          });

          doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
          doc.moveDown();

          doc.fontSize(14).text("Total:", 50, doc.y, { continued: true });
          doc.text(`$${cart.total_price.toFixed(2)}`, 430, doc.y);

          doc.end();

          console.log("PDF generation initiated");

          doc.on("end", () => {
            console.log("PDF document end event triggered");
          });

          doc.on("error", (pdfError) => {
            throw new Error(PaymentMessage.PDFCreationError);
          });
        })
        .catch((error) => {
          console.error("Error while processing products:", error);
          reject(new Error("Error while processing products"));
        });
    });
  }

  async placedOrder(): Promise<String> {
    return PaymentMessage.OrderSuccess;
  }
}
export default new PaymentServices();
