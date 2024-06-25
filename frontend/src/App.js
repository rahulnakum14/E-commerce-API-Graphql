import styles from "./App.module.css";
import User from "./components/User";
import { useState } from "react";

function App() {
  // const tmp = [
  //   { name: "qwerty", isAge: 45 },
  //   { name: "aaaaaaaaa", isAge: 50 },
  //   { name: "ewrwer", isAge: 20 },
  // ];

  // const [age, setAge] = useState(5);

  // const IncreaseAge = () => {
  //   setAge(age + 1);
  // };

  const [inputValue, setInputValue] = useState("black");

  return (
    <div className={styles.App}>
      <button
        onClick={() => {
          setInputValue("red");
        }}
      >
        SHow/hide
      </button>
      {inputValue ? <h1 style={{ color: inputValue }}>Testing Text</h1> : null}

      {/* {inputValue} */}

      {/* <button onClick={IncreaseAge}>Increase Age</button>

      {age} */}

      {/* {tmp.map((value, key) => {
        return <User key={key} name={value.name} age={value.isAge} />;
      })} */}

      {/* {tmp > 18? <h1>Greater than 18</h1>: <h1>Under 18</h1>} */}
      {/* <User name="asdad" email="sdfs@sdfssssssssssssss.com"/> */}
      {/* <User className={styles.name} name="we32" email="ddddddd@sdfssssssssssssss.com"/> */}
    </div>
  );
}

export default App;
