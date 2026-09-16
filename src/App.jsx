import './App.css'
import CareerCard from './components/CareerCard'
import {careerRoles} from './data/career'
import { useState } from 'react'

function App() {
  const [expandedRoleId, setExpandedRoleId] = useState(null)
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

      <ol className="career-timeline">
        {careerRoles.map((role) => (
          <li className="timeline-item" key={role.id}>
            <CareerCard
              role={role}
              isExpanded={expandedRoleId === role.id}
              onToggle={() =>
                setExpandedRoleId((previousId) =>
                  previousId === role.id ? null : role.id
                )
              }
            />
          </li>
        ))}
      </ol>

      </section>

      
      <div className="ticks"></div>

      

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
