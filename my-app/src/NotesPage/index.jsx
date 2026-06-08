import React, { useState } from 'react'
import '.././App.css'
import { Routes, Route, Link } from 'react-router-dom';
import Note from './Note';

const categories = {
  Python: [
    'Python 常用指令',
    'Pandas & Numpy'
  ],
  JavaScript: [
    'JavaScript 常用指令',
    'React',
    'NextJS'
  ],
  React: [
    'React HOOK'
  ]
}

export default function NotesPage() {
  return (
    <div className='NotesPage'>
      <SideBar categories={categories} />
      <Routes>
        <Route path='/:path/:name' element={<Note />} />
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
        <ul>
          {notes.map((note, index) => (
            <li key={index}>
              <SideBarItemChild note={note} path={`${name}/${note}`} />
            </li>
          ))}
        </ul>
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
  const { note, path } = props;
  return (
    <Link to={`/ChrisSu/NotesPage/${path}`} state={{ note: note, path: path }}>
      {note}
    </Link>
  )
}