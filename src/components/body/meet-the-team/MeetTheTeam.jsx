import React from "react";
import "./MeetTheTeam.css";

import Troz from "../../../assets/troz.869f9716.png";

const teamMembers = [
  {
    image: "",
    name: "CHELLIOS",
    title: "Artist",
  },
  {
    image: "",
    name: "FLOYDIAN",
    title: "Website and Smart Contract Developer",
  },
  {
    image: "",
    name: "GOLGEDAR",
    title: "Rarity and Algorithm Developer",
  },
];

const MeetTheTeam = () => {
  return (
    <div className="meet">
      <div className="meet-content">
        <div className="meet-title">MEET THE TEAM</div>
        <div className="meet-team">
          {teamMembers.map((member) => {
            return (
              <div className="meet-team-member">
                <img
                  className="meet-team-member-image"
                  src={Troz}
                  alt="member"
                />
                <div className="meet-team-member-name"> {member.name} </div>
                <div className="meet-team-member-title">{member.title}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MeetTheTeam;
