import { React } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import '.././App.css'

// file
import NavigationBar from './NavigationBar'
import IntroductionPage from '../IntroductionPage'
import NotesPage from '../NotesPage'
import ToolsPage from '../ToolsPage'
import PhotoPage from '../PhotoPage'
import PhotoDetail from '../PhotoPage/PhotoDetail'




// const Page2 = () => {
//   return (
//     <div style={{textAlign: 'center'}}>開發中</div>
//   )
// }

const routers = [
  {
    name: '個人簡介',
    element: <IntroductionPage />,
    path: '/IntroductionPage'
  },
  {
    name: '筆記總覽',
    element: <NotesPage />,
    path: '/NotesPage'
  },
  {
    name: '懶人工具',
    element: <ToolsPage />,
    path: '/ToolsPage'
  },
  {
    name: '相片專區',
    element: <PhotoPage />,
    path: '/PhotoPage'
  }
  
]

export default function MainPage () {
  return (
    <BrowserRouter>
      <NavigationBar routers={routers} />
      <div className='App-content'>
        <Routes>
          {routers.map((router, index) => (
            <Route key={index} element={router.element} path={`${router.path}/*`} />
          ))}
          <Route element={<PhotoDetail />} path={'/PhotoDetail/:name'} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
