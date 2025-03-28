import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
          <h1 className="text-4xl font-bold text-emerald-600">Tailwind is officially working.</h1>
          <p>And of course the React app is working as well. The above title is styled by Tailwind.</p>
      </div>
    </>
  )
}

export default App
