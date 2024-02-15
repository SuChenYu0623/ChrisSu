import React from 'react';
import '.././App.css'

const introduction = {
  cn_name: '蘇禎佑',
  en_name: 'chris',
  avatar: 'https://images.chinatimes.com/newsphoto/2023-09-14/656/20230914006019.jpg',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology EE',
  company: 'BigGo 樂方股份有限公司',
  program_lan: 'JavaScript, Python, C, solidity',
  experience: 'React, React Native, Extension, JS爬蟲, 智能合約'


}

export default function IntroductionPage() {
  // const { introduction } = props;
  return (
    <div className='IntroductionPage'>
      <Avatar introduction={introduction} />
      <Introduction introduction={introduction} />
    </div>
  )
}

function Avatar(props) {
  const { introduction } = props
  return (
    <div className='Avatar'>
      <img src={introduction.avatar} />
    </div>
  )
} 

function Introduction(props) {
  const { introduction } = props
  return (
    <div className='Introduction'>
      <h1>{introduction.cn_name} {introduction.en_name}</h1>
      <h4>生日 {introduction.birthday}</h4>
      <h4>任職於 {introduction.company}</h4>
      <h4>畢業於 {introduction.school}</h4>
      <h4>程式語言 {introduction.program_lan}</h4>
      <h4>專案經歷 {introduction.experience}</h4>
    </div>
  )
}