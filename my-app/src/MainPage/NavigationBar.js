import { React } from 'react'
import { Link } from 'react-router-dom';
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
      <Link to={router.path}>{router.name}</Link>
    </div>
  )
}

export default NavigationBar;