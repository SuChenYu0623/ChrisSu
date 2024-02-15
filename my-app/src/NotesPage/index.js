import React, { useState } from 'react'
import '.././App.css'
import { Routes, Route, Link, useLocation } from 'react-router-dom';

const categories = {
  Python: [
    'Python 常用指令',
    'Pandas & Numpy'
  ],
  Javascript: [
    'Javascript 常用指令',
    'React',
    'NextJS'
  ]
}

export default function NotesPage() {
  return (
    <div className='NotesPage'>
      <SideBar categories={categories} />
      <Routes>
        <Route path='/:name' element={<Note />} />
      </Routes>
    </div>
  )
}

function SideBar(props) {
  const { categories } = props;
  return (
    <div className='SideBar'>
      {Object.keys(categories).map(key => (
        <ul key={key}>
          <SideBarItem notes={categories[key]} name={key} />
        </ul>
      ))}
    </div>
  )
}

function SideBarItem(props) {
  const { notes, name } = props
  let [status, setStatus] = useState(false);

  const handleStatus = () => {
    let newStatus = status === true ? false : true
    setStatus(newStatus)
  }
  return (
    <div>
      <SideBarItemParent 
        status={status} 
        name={name} 
        handleChange={handleStatus} 
      />
      <div style={status ? {display: 'none'} : {display: ''}}>
        <SideBarItemChild notes={notes}/>
      </div>
    </div>
  )
}

function SideBarItemParent(props) {
  const { status, name, handleChange } = props;
  return (
    <div className='SideBarItemParent'>
      <div className='title'>{name}</div>
      <a className={status ? 'downArrow' : 'upArrow'} onClick={handleChange}>
      </a>
    </div>
  )
}

function SideBarItemChild(props) {
  const { notes } = props;
  return (
    <ul>
      {notes.map((note, index) => (
        <li key={index}>
          <Link to={`/NotesPage/${note}`} state={{ note: note }}>
            {note}
          </Link>
        </li>
      ))}
    </ul>
  )
}


function Note() {
  const location = useLocation()
  const { note } = location.state
  console.log('Note', location)
  return (
    <div className='Note'>
      <div>{note ? note : '筆記為空'}</div>
    </div>
  )
}