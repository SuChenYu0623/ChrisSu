import React, { useState, useRef } from "react";
import {  useLocation } from 'react-router-dom';
import '../App.css'
import heartClick from '../images/heartClick.png'
import heartNotClick from '../images/heartNotClick.png'
import message from '../images/message.png'
import send from '../images/send.png'
import bookmark from '../images/bookmark.png'

export default function PhotoDetail() {
  const location = useLocation()
  const { images, title } = location.state
  const [ count, setCount ] = useState(0)

  const scrollRef = useRef(null);
  const scrollLeft = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: -100, behavior: 'smooth' });
  };
  const scrollRight = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 100, behavior: 'smooth' });
  };

  const LeftArrow = (props) => {
    const { scrollLeft } = props
    return (
      <a style={{position: 'relative', padding: '0px 10px', alignContent: 'center'}} 
        onClick={scrollLeft}>
        <div className="leftArrow" ></div>
        <div className="defaultMask"></div>
      </a>
    )
  }
  const RightArrow = (props) => {
    const { scrollRight } = props
    return (
      <a style={{position: 'relative', padding: '0px 10px', alignContent: 'center'}} 
        onClick={scrollRight}>
        <div className="rightArrow" ></div>
        <div className="defaultMask"></div>
      </a>
    )
  }

  const HeartButton = () => {
    const [ click, setClick ] = useState(false)
    const heartImg = click ? heartClick : heartNotClick
    const style = {
      height: '30px',
    }
    return (
      <a style={style} onClick={() => setClick(!click)}>
        <img style={style} src={heartImg}  />
      </a>
    )
  }

  const MessageButton = () => {
    const style = {
      height: '30px',
      marginLeft: '5px'
    }
    return (
      <a style={style} onClick={() => alert('未開放留言功能')}>
        <img style={style} src={message}  />
      </a>
    )
  }
  const SendButton = () => {
    const style = {
      height: '30px',
      marginLeft: '5px'
    }
    return (
      <a style={style} onClick={() => alert('未開放分享功能')}>
        <img style={style} src={send}  />
      </a>
    )
  }
  const BookMark = () => {
    const style = {
      height: '30px',
      marginLeft: '5px'
    }
    return (
      <a style={style} onClick={() => alert('未開放收藏功能')}>
        <img style={style} src={bookmark}  />
      </a>
    )
  }
  

  return (
    <div className="PhotoDetail">
      <div className="PhotoContainer">
        <div className="PhotoHeader">
          <div>{title}</div>
        </div>
        <div className="PhotoContent">
          <DefaultImage image={images[count]} width={'100%'} />
          <div className="PhotoBar">
            <LeftArrow scrollLeft={scrollLeft} />
            <div className="PhotoBarContent" ref={scrollRef}>
              {images.map((image, index) => (
                <a key={index} onClick={() => setCount(index)}>
                  <DefaultImage image={image} width={'60px'} />
                </a>
              ))}
            </div>
            <RightArrow scrollRight={scrollRight} />
          </div>
        </div>
        
        <div className="PhotoFooter">
          <div style={{display: 'flex', alignItems: 'center', padding: '10px'}}>
            <HeartButton />
            <MessageButton />
            <SendButton />
          </div>
          <div style={{display: 'flex', alignItems: 'center', padding: '10px'}}>
            <BookMark />
          </div>
        </div>
      </div>
    </div>
  )
}

function DefaultImage(props) {
  const { image, width } = props
  const style = {
    width: width,
  }
  return (
    <div style={{ position: 'relative' }}>
      <img className="defaultImg" style={style} src={image} alt='image' />
      <div className="defaultMask"></div>
    </div>
  )
}