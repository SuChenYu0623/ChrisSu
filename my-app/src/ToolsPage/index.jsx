import React from 'react'
import '.././App.css'
import { Routes, Route, Link } from 'react-router-dom';
import CheckDumplicationItems from './CheckDumplicationItems';
import CheckCookieDiff from './CheckCookieDiff';

const categories = {
  cats: [
    '檢查重複元素',
    '檢查 cookie 差異'
  ]
}

export default function ToolsPage() {
  return (
    <div className='ToolsPage'>
      <SideBar categories={categories} />
      <Routes>
        <Route path='/檢查重複元素' element={<CheckDumplicationItems />} />
        <Route path='/檢查 cookie 差異' element={<CheckCookieDiff />} />
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
          <Link to={`/ChrisSu/ToolsPage/${note}`} state={{ note: note }}>
            {note}
          </Link>
        </li>
      ))}
    </ul>
  )
}

