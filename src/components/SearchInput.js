import React,{useState} from 'react'

const SearchInput = ({onSearch}) => {
const [input, setInput] = useState("");

const submitHandler = (e) =>{
     e.preventDefault();
     if (input.trim()) {
       onSearch(input.trim());
     }
};

  return (
 <form onSubmit = {submitHandler}>
    <input
      type = "text" 
      placeholder="Type the country name...." 
      value={input} 
      onChange={(e) => setInput(e.target.value)}>
    </input>
  </form>
  );
};

export default SearchInput;