import { useState,useEffect } from "react";
import React from "react";

const SubmitForm = ({ onSendMessage,show}) => {
   const [values, setValues] = useState({
        firstname:"",
        lastname:"",
        dob:"",
        email:"",
        phone:"",        
    });

    const [submitted,setSubmitted]=useState(false)
//   const onSubmit = (e) => {
//     e.preventDefault();
//   };

const getLocal=()=>{
    let data=localStorage.getItem("User");
    console.log(data);
    if(data){
        return JSON.parse(localStorage.getItem('User'));
    }
    else{
        return [];
    }
}

const [records, setRecords]=useState(getLocal());

    const inputData =(e) => {
    const name=e.target.name;
    const value=e.target.value;
    console.log(name,value);

    setValues({ ...values, [name]:value });
    console.log(values+'kkkk');
    }

  const onSubmit =(e) =>{
    setSubmitted(true)
    e.preventDefault();
    const newRecord={...values}
    // console.log(newRecord +'jagratjiiiiiiiiii');
    setRecords([...records, newRecord]);
    // console.log(records);

    

    setValues({firstname:"",lastname:"",dob:"",email:"",phone:""})

}

useEffect(()=>{
    localStorage.setItem("User",JSON.stringify(records));
},[records]);

  return (
    <div className="submitForm">
    
      <form className="submitForms"
        onSubmit={(e) => onSubmit(e)}
        style={{ display: show ? "none" : "block" }}

      >
        <h3>Registration Form</h3>
       <fieldset>
      <input className="content" name="firstname" onChange={inputData} value={values.firstname} placeholder="Your First name" type="text" tabindex="1" required autofocus/>
    </fieldset>
    <fieldset>
      <input  className="content" name="lastname" onChange={inputData} value={values.lastname} placeholder="Your Last name" type="text" tabindex="1" required autofocus/>
    </fieldset>
    <fieldset>
      <input  className="content" name="dob" onChange={inputData} value={values.dob} placeholder="Your DOB" type="date" id='dateofBirth' tabindex="4" required/>
    </fieldset>
    <fieldset>
      <input  className="content" name="email" onChange={inputData} value={values.email} placeholder="Your Email Address" type="email" tabindex="2" required/>
    </fieldset>
    <fieldset>
      <input  className="content" name="phone" onChange={inputData} value={values.phone} placeholder="Your Mobile Number " type="tel" tabindex="3" required/>
    </fieldset>
    <fieldset>
      <button name="submit" type="submit" id="contactsubmit" data-submit="...Sending">Submit</button>
    </fieldset>    
      </form>
    </div>
  );
};

export default SubmitForm;
