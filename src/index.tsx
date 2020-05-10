import './react-app-env.d.ts'
import * as serviceWorker from './serviceWorker'
import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()

/*
declare global {
  interface Object {
    m<T, R>(fn1: (o: T) => R): R
  }
}

Object.prototype.m = function (fn) {
  return fn(this)
}

const b = { a: '1' }.m(lol => lol.a)
type M<T> = {
  m: <R>(fn1: <R>(o: T) => R) => T
}
const m: M = { m: fn => fn({ a: 'a' }) }

const res = m.m(lol => lol.a)
*/
