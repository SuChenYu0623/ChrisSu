import React, { useState, useRef } from "react";
import copyImg from '../images/copy.png';
import '../App.css'

export default function CheckDumplicationItems() {
  const [state, updateState] = useState({
    code: '',
    key: '',
    notRepeatArr: [],
    RepeatArr: [],
  });
  
  const handleState = (e) => {
    const { name, value } = e.target
    updateState({
      ...state,
      [name]: value
    })
  }

  const checkDumplication = () => {
    const { code, key } = state
    let { notRepeatArr, RepeatArr } = state
    const cleanCode = (code) => {
      return code
        .trim()
        .replace(/[\n]/gm, '')
        .replace(/(['"]|)([A-Za-z0-9]+)(['"]|)/gm, `"$2"`)
    }
    try {
      const arr = JSON.parse(cleanCode(code))
      const isKeyEmpty = key === ''
      const filterFunc = isKeyEmpty
        ? (item, index) => arr.indexOf(item) === index
        : (item, index) => arr.map(tmp => tmp[key]).indexOf(item[key]) === index
      notRepeatArr = arr.filter(filterFunc)
      RepeatArr = arr.filter((item, index) => !filterFunc(item, index))

      updateState({
        ...state,
        notRepeatArr: notRepeatArr,
        RepeatArr: RepeatArr
      })
      console.log(notRepeatArr, RepeatArr)
    } catch (error) {
      console.log(error)
    }
  }
  
  return (
    <div className='ToolsContent'>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
        <TextArea name={'code'} value={state.code} onChange={handleState} />
        <div>
          <input type='text' name='key' value={state.key} onChange={handleState} />
          <br />
          <input type='submit' onClick={checkDumplication} />
        </div>
      </div>
      <Result state={state} handleState={handleState} />
    </div>
  )
}

function Result(props) {
  const { state } = props;
  const { handleState } = props
  return (
    <div className='Result'>
      <div>重複arr</div>
      <TextArea value={state.RepeatArr} onChange={handleState} disabled={true} />
      <div>不重複arr</div>
      <TextArea value={state.notRepeatArr} onChange={handleState} disabled={true} />
    </div>
  )
}

function TextArea (props) {
  const { name, value, disabled, onChange } = props;
  const textareaRef = useRef('');
  const copyText = () => {
    textareaRef.current.select();
    document.execCommand("copy");
    alert("已複製到剪貼板: " + textareaRef.current.value);
  };
  return (
    <div className='TextArea'>
      <div className='Option'>
        <a onClick={copyText}>copy</a>
        <img src={copyImg} />
      </div>
      <textarea 
        name={name} 
        value={disabled ? JSON.stringify(value) : value} 
        onChange={onChange} 
        ref={textareaRef}
        disabled={disabled}
      ></textarea>
    </div>
  )
}