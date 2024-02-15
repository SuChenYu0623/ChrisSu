import React from 'react'
import '.././App.css'
import { Routes, Route, Link } from 'react-router-dom';
import CheckDumplicationItems from './CheckDumplicationItems';

const categories = {
  cats: [
    'check dumplication items',
    'cookie diff'
  ]
}

export default function ToolsPage() {
  return (
    <div className='ToolsPage'>
      <SideBar categories={categories} />
      <Routes>
        <Route path='/check dumplication items' element={<CheckDumplicationItems />} />
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
  const { notes } = props
  return (
    <div>
      <SideBarItemChild notes={notes}/>
    </div>
  )
}

function SideBarItemChild(props) {
  const { notes } = props;
  return (
    <ul>
      {notes.map((note, index) => (
        <li key={index}>
          <Link to={`/ToolsPage/${note}`} state={{ note: note }}>
            {note}
          </Link>
        </li>
      ))}
    </ul>
  )
}

