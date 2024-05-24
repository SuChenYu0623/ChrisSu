import React, { useState, useRef } from "react";
import copyImg from '../images/copy.png';
import '../App.css'


export default function CheckCookieDiff() {
  const [state, updateState] = useState({
    code1: '',
    code2: '',
    outTable: [],
    key: ''
  });

  const handleState = (e) => {
    const { name, value } = e.target
    updateState({
      ...state,
      [name]: value
    })
  }

  const checkCookieDiff = () => {
    const { code1, code2 } = state
    let { outTable } = state
    const cleanCode = (code) => {
      return code
        .split('; ')
        .map(item => {
          let key = item.slice(0, item.indexOf('='))
          let value = item.slice(item.indexOf('=') + 1, item.length)
          return [key, value]
        })
    }

    const compareTwoArray = (arr1, arr2) => {
      let result = {}
      let arr2_keys = arr2.map(item => item[0]);
      for (let item of arr1) {
        let key = item[0]
        let value = item[1]

        // 檢查有無不重複的 key
        if (!arr2_keys.includes(key)) {
          result[key] = { value: value, message: '[this cookie is not defined]' }
          continue
        }

        // 檢查有無不重複的value
        if (value !== arr2.find(item => item[0] === key)[1]) {
          result[key] = { value: value, message: '[this cookie value is modified]' }
          continue
        }
      }
      return result
    }
    try {
      let cookie1 = cleanCode(code1)
      let cookie2 = cleanCode(code2)
      let output = {}
      output.before = compareTwoArray(cookie1, cookie2)
      output.after = compareTwoArray(cookie2, cookie1)
      
      outTable = [];
      [...Object.keys(output.before), ...Object.keys(output.after)]
        .filter((item, index, arr) => arr.indexOf(item) === index)
        .forEach(key => {
          let beforeValue = output.before[key]?.value
          let afterValue = output.after[key]?.value
          let message = output.before[key]?.message || output.after[key]?.message

          outTable.push([key, beforeValue, afterValue, message])
          console.group(`key=${key}`)
          console.log(`beforeValue=${beforeValue}`)
          console.log(`afterValue =${afterValue}`)
          console.log(`message    =${message}`)
          console.groupEnd()
        })
      // 送出報告
      console.log(outTable)
      updateState({
        ...state,
        outTable: outTable
      })
      // console.log(notRepeatArr, RepeatArr)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div className="ToolsContent">
      <div style={{display: 'flex', padding: '10px'}} className="h-medium">
        <div style={{margin: '10px'}} className="h-large w-medium">
          <TextArea name={"code1"} value={state.code1} onChange={handleState} />
        </div>
        <div style={{margin: '10px'}} className="h-large w-medium">
          <TextArea name={"code2"} value={state.code2} onChange={handleState} />
        </div>
      </div>
      <div style={{padding: '10px', display: 'flex', justifyContent: 'center'}}>
        <div style={{marginTop: '20px'}}>
          <button onClick={() => checkCookieDiff()}>parse</button>
        </div>
      </div>
      <div style={{padding: '10px', display: 'flex', justifyContent: 'center'}} className="h-medium">
        <div style={{margin: '10px'}} className="h-large w-large">
          <div className="h-large w-large">
            <table width={'100%'}>
              <thead>
                <tr>
                  <th className="col-xs-2">cookie</th>
                  <th className="col-xs-6">before</th>
                  <th className="col-xs-6">after</th>
                  <th className="col-xs-4">message</th>
                </tr>
              </thead>
              <tbody>
                {state.outTable.map(item => {
                  let [key, beforeValue, afterValue, message] = item
                  return (
                    <tr key={key}>
                      <td className="col-xs-2">{key}</td>
                      <td className="col-xs-6">{beforeValue}</td>
                      <td className="col-xs-6">{afterValue}</td>
                      <td className="col-xs-6">{message}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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