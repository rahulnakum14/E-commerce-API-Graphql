import React from 'react'

const User = (props) => {
    const {name,age} = props
    console.log(age);
  return (
    <div className={name}>
              {age > 20 ? <h1>{name}</h1> : null}

    </div>
  )
}

export default User
