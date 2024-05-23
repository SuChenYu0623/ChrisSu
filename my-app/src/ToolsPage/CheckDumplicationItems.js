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
        .replace(/(['"]|)([A-Za-z0-9]+)(['"]|):/gm, `"$2":`)
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
      <div style={{display: 'flex', padding: '10px'}} className="h-medium">
        <div style={{margin: '10px'}} className="w-medium">
          <div className="h-large">
            <TextArea name={'code'} value={state.code} onChange={handleState} />
          </div>
        </div>
        <div style={{margin: '10px'}} className="w-medium">
          <div className="h-medium">
            <TextArea name={'Repeat'} value={state.RepeatArr} onChange={handleState} />
          </div>
          <div className="h-medium">
            <TextArea name={'notRepeat'} value={state.notRepeatArr} onChange={handleState} />
          </div>
        </div>
      </div>
      <div style={{padding: '10px'}}>
        <div style={{margin: '10px'}}>
          輸入需要檢查的key值 (如果只是單純的array，保持為空即可)
        </div>
        <div style={{margin: '10px'}}>
          <input type='text' name='key' value={state.key} onChange={handleState} />
        </div>
        <div style={{margin: '10px'}}>
          <input type='submit' onClick={checkDumplication} />
        </div>
        </div>
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
        <span className="copy-title">{name}</span>
        <div className="copy-btn">
          <a onClick={copyText}>copy</a>
          <img src={copyImg} /> 
        </div>
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