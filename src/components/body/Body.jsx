import React from "react";
import "./Body.css";

import Jumbotron from "./jumbotron/Jumbotron";
import MeetTheTeam from "./meet-the-team/MeetTheTeam";
import Roadmap from "./roadmap/Roadmap";

const Body = () => {
  return (
    <div className="body">
      <Jumbotron />
      <Roadmap />
      <MeetTheTeam />
    </div>
  );
};

export default Body;
