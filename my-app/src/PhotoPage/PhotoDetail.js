import React, { useState } from "react";
import {  useLocation } from 'react-router-dom';
import '../App.css'
// import copyImg from '../images/copy.png';

export default function PhotoDetail() {
  const location = useLocation()
  const { images } = location.state

  const [ count, setCount ] = useState(0)
  return (
    <div className="PhotoDetail">
      <div className="single-image">
        
        <DefaultImage image={images[count]} width={'100%'} />
        
        <div className="select-images-bar">
          {images.map((image, index) => (
            <a key={index} onClick={() => setCount(index)}>
              <DefaultImage  image={image} />
            </a>
          ))}
        </div>
      </div>
      <div className="multi-images">
        {images.map((image, index) => (
          <DefaultImage key={index} image={image} width={'100%'} />
        ))}
      </div>
    </div>
  )
}


function DefaultImage(props) {
  const { image, width } = props
  const style = {
    width: width
  }

  return (
    <div style={{ position: 'relative' }}>
      <img className="defaultImg" style={style} src={image} alt='image' />
      <div className="defaultMask"></div>
    </div>
  )
}