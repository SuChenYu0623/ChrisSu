import { React } from 'react'
import '.././App.css'
function NavigationBar (props) {
  const { routers } = props;
  return (
    <div className='NavigationBar'>
      {routers.map(router => (
        <NavigationItem key={router.path} router={router} />
      ))}
    </div>
  )
}

function NavigationItem (props) {
  const { router } = props;
  return (
    <div className='NavigationItem'>
      <a href={router.path}>{router.name}</a>
    </div>
  )
}

export default NavigationBar;