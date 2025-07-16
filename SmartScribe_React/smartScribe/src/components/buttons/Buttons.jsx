import React from 'react'

function Buttons({btn}) {
  return (
    <>
        <button>
            <Link to={btn.path}>
                {btn.name}
            </Link>
        </button>
    </>
  )
}

export default Buttons