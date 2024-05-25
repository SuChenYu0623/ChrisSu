import React from 'react';
import '.././App.css'
import BG_IMG from '../images/BG.png';
import BG_CODE1 from '../images/BG-code1.jpg'
// const BG_CODE1 = 'https://png.pngtree.com/thumb_back/fw800/background/20240125/pngtree-an-orange-cat-asleep-image_2499590.png'

// Avatar
import reactImg from '../images/react.png'
import githubImg from '../images/github.png';
import linkImg from '../images/link.png';

const introduction = {
  cn_name: '蘇禎佑',
  en_name: 'chris',
  birthday: '1999/06/23',
  school: 'National Kaohsiung University of Science and Technology EE',
  company: 'BigGo 樂方股份有限公司',
  program_lan: 'JavaScript, Python, C, solidity',
  experience: ['React', 'Extension', 'JS爬蟲', '智能合約', 'AI']
  // experience: 'React, React Native, Extension, JS爬蟲, 智能合約'
}

export default function IntroductionPage() {
  return (
    <div className='IntroductionPage'>
      <div className='IntroductionContent' style={{backgroundImage: `url(${BG_IMG})`}}>
        <Avatar image={BG_IMG} />
        <Introduction introduction={introduction} />
      </div>
      <div id="React" className='IntroductionContent' style={{backgroundImage: `url(${BG_CODE1})`}}>
        <Avatar image={reactImg} width={'200px'} />
        <ExperienceReact />
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

function Avatar(props) {
  const { image, width } = props
  const _padding = width
    ? (400 - +width?.match(/([0-9]+)/)?.[1])/2
    : 0
  console.log('w', width)
  const style = width 
    ? { width: width, height: width, padding: `${_padding}px`}
    : {}
  return (
    <div className='Avatar' style={style}>
      <img src={image}/>
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
            {/* <td colSpan="4">{introduction.experience}</td> */}
            <td colSpan="4">
              {introduction.experience.map((item, index) => (
                <span 
                  key={index}
                  style={{color: '#5B4B00', fontWeight: 'bold'}}
                  onClick={() => document.querySelector(`#${item}`)?.scrollIntoView({ behavior: "smooth" })} 
                  >{item}&nbsp;&nbsp;&nbsp;</span>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ExperienceReact() {
  return (
    <div className='Introduction Experience'>
      <div className='Introduction-title'>
        <div>React Project</div>
      </div>
      <br/>
      <div className='Introduction-subtitle'>
        <div>WEB</div>
      </div>
      <table style={{borderTop: '1px black solid'}}>
        <tbody>
          <tr>
            <th colSpan="6">PROJECT NAME</th>
            <td colSpan="4">
              <ExperienceProject 
                title={"SocialMedia"} 
                githubLink={"https://github.com/SuChenYu0623/SocialMedia"}
                linkLink={"https://suchenyu0623.github.io/SocialMedia/"} />
            </td>
          </tr>
          <tr>
            <th colSpan="6">PROJECT NAME</th>
            <td colSpan="4">
              <ExperienceProject 
                title={"Game"}
                githubLink={"https://github.com/SuChenYu0623/Game"}
                linkLink={"https://suchenyu0623.github.io/Game/"} />
            </td>
          </tr>
        </tbody>
      </table>

      <br />
      <div className='Introduction-subtitle'>
        <div>APP</div>
      </div>
      <table style={{borderTop: '1px black solid'}}>
        <tbody>
          <tr>
            <th colSpan="6">PROJECT NAME</th>
            <td colSpan="4">
              <ExperienceProject title={"RandomSelectMealApp"} githubLink={"https://github.com/SuChenYu0623/RandomSelectMealApp"} />
            </td>
          </tr>
          <tr>
            <th colSpan="6">PROJECT NAME</th>
            <td colSpan="4">
              <ExperienceProject title={"ReactNative_game_app"} githubLink={"https://github.com/SuChenYu0623/ReactNative_game_app"} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function ExperienceProject(props) {
  const { title, githubLink, linkLink } = props
  return (
    <div className='ExperienceProject' >
      {title}
      <a className='ExperienceLink' style={{backgroundImage: githubImg}} href={githubLink} target="_blank" rel="noreferrer"></a>
      {linkLink 
        ? <a className='ExperienceLink' style={{backgroundImage: `url(${linkImg})`}} href={linkLink} target="_blank" rel="noreferrer"></a>
        : <div></div>
      }
    </div>
  )
}