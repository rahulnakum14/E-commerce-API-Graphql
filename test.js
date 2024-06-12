const validateUser = (
    email
  ) => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      
    if(email !== undefined ){
      const result = emailRegex.test(email)
      console.log(result);
      
      if(!result){
        console.log('test');
        
        return false
      }
    }
    return true;
  };


  console.log(validateUser('rahul.nakum14gmail.com'));