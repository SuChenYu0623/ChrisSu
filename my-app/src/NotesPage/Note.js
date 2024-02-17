
import React from 'react'
import '.././App.css'
import { useLocation } from 'react-router-dom';

export default function Note() {
  const location = useLocation()
  console.log(location.state)
  const { note } = location.state
  console.log('Note', location)
  return (
    <div className='Note'>
      <div>{note ? note : '筆記為空'}</div>
    </div>
  )
}