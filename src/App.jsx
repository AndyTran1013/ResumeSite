import './App.css'

function App() {
 
  return (
    <>
      <section id="center">
        <div className="intro">
          <h1>Andy Tran</h1>

          <p>
            Risk and analytics leader with a focus on data, automation, and practical tools.
          </p>
          <p>
            Exploring opportunities in data analytics and automation.
          </p>
          
          <a className="explore-link" href="#career-heading">
            Explore my career
          </a>

        </div>
      </section>

      <section className="career" aria-labelledby="career-heading">
        <h2 id="career-heading">Career experience</h2>

        <article className="career-entry">
          <h3>Senior Manager, Personal Lending Credit Strategies</h3>

          <p>BMO · Enterprise Risk and Portfolio Management</p>
          <p>
            <time dateTime="2024-03">March 2024</time>
            {' – '}
            <time dateTime="2026-09-01">September 2026</time>
          </p>
          
        </article>
      </section>

      
      <div className="ticks"></div>

      

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
