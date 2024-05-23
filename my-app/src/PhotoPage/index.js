import React from "react";
import { Link } from 'react-router-dom';
import '../App.css'

const images = [
  'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-cute-cat-animal-png-image_10149335.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-sitting-orange-cat-on-white-background-png-image_7094889.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-cat-isolated-on-white-background-png-image_7094972.png',
  'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-cute-cat-animal-png-image_10149335.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-sitting-orange-cat-on-white-background-png-image_7094889.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-cat-isolated-on-white-background-png-image_7094972.png',
  'https://png.pngtree.com/png-vector/20230928/ourmid/pngtree-cute-cat-animal-png-image_10149335.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-isolated-sitting-orange-cat-on-white-background-png-image_7094889.png',
  'https://png.pngtree.com/png-clipart/20230511/ourmid/pngtree-cat-isolated-on-white-background-png-image_7094972.png'
]


export default function PhotoPage () {
  return (
    <div style={{width: '50%'}}>
      <PhotoAlbum images={images} title={"相簿1"} />
      <PhotoAlbum images={images} title={"相簿2"} />
      <PhotoAlbum images={images} title={"相簿3"} />
      <PhotoAlbum images={images} title={"相簿4"} />
      <PhotoAlbum images={images} title={"相簿5"} />
      <PhotoAlbum images={images} title={"相簿6"} />
    </div>
  )
}

function PhotoAlbum(props) {
  const { images, title } = props
  return (
    <Link className="PhotoAlbum" to={`/PhotoDetail/${title}`} state={{ images: images }}>
      <div>
        <img className="PhotoAlbumLeft defaultImg" src={images[0]} alt='image' />
        <img className="PhotoAlbumMid defaultImg" src={images[1]} alt='image' />
        <img className="PhotoAlbumRight defaultImg" src={images[2]} alt='image' />
      </div>
      <div className="defaultMask"></div>
      <div>{title}</div>
    </Link>
  )
}



