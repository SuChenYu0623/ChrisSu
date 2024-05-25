import React from 'react';
import '.././App.css'
import BG_IMG from '../images/BG.png';

const introduction = {
  cn_name: '蘇禎佑',
  en_name: 'chris',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology EE',
  company: 'BigGo 樂方股份有限公司',
  program_lan: 'JavaScript, Python, C, solidity',
  experience: 'React, React Native, Extension, JS爬蟲, 智能合約'
}

export default function IntroductionPage() {
  return (
    <div className='IntroductionPage'>
      <div className='IntroductionContent'>
        <Avatar />
        <Introduction introduction={introduction} />
      </div>
      <div className='IntroductionSaying'>
        <div className='IntroductionSayingContent'>
          <div className='ch-saying'>生而為人，能照顧愛惜自己就好了！</div>
          <div className='kr-saying'>인간으로서 스스로를 돌볼 수 있다면 참 좋을 것 같아요</div>
        </div>
      </div>
      
    </div>
  )
}

function Avatar() {
  return (
    <div className='Avatar'>
      <img src={BG_IMG} />
    </div>
  )
} 

function Introduction(props) {
  const { introduction } = props
  return (
    <div className='Introduction'>
      <div className='Introduction-title'>
        <div>Crawler Enginer & Front End</div>
      </div>
      <br/>
      <table style={{borderTop: '1px black solid'}}>
        <tbody>
          <tr>
            <th colSpan="6">NAME</th>
            <td colSpan="4">{introduction.cn_name} {introduction.en_name}</td>
          </tr>
          <tr>
            <th colSpan="6">BORN DATE</th>
            <td colSpan="4">{introduction.birthday}</td>
          </tr>
          <tr>
            <th colSpan="6">WORK AT</th>
            <td colSpan="4">{introduction.company}</td>
          </tr>
          <tr>
            <th colSpan="6">GRADUATED FROM</th>
            <td colSpan="4">{introduction.school}</td>
          </tr>
          <tr>
            <th colSpan="6">PROGRAM LANGUAGE</th>
            <td colSpan="4">{introduction.program_lan}</td>
          </tr>
          <tr>
            <th colSpan="6">PROJECT EXPERIENCE</th>
            <td colSpan="4">{introduction.experience}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}