
import React, { useState } from 'react'
import '.././App.css'
import { useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';


export default function Note() {
  const location = useLocation()
  const { path } = location.state
  let [text, setText] = useState('');
  import(`./notes/${path}.md`)
    .then(module => {
      fetch(module.default)
        .then(res => res.text())
        .then(text => setText(text))
    })
    .catch(() => {
      setText('')
    })
  return (    
    <div className='Note'>
      <Markdown
        // eslint-disable-next-line react/no-children-prop
        children={text}
        components={{
          // Map `h1` (`# heading`) to use `h2`s.
          h1: 'h2',
          pre(props) {
            const { children } = props
            return (
              <pre className='markdown-pre'>
                <code>{children}</code>
                <a onClick={() => {
                  navigator.clipboard.writeText(children.props.children)
                }}>
                  <span>複製</span>
                </a>
              </pre>
            )
          }
        }}
      />
    </div>
  )
}