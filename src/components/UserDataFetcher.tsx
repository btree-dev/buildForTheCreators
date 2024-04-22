import React, { useEffect, useRef, useState } from 'react';
import RoleRequirements from "./Requirements"
import { Guild, Role } from "../types"

const UserDataComponent = ({ apiUrl }) => {
  const [displayName, setDisplayName] = React.useState('');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        console.log(userData);
        const userDisplayName = userData.result.user.displayName;
        setDisplayName(userDisplayName);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, [apiUrl]); // Dependency array includes apiUrl to re-fetch data when it changes

  return (
    <div>
      <h2></h2>
      <p>{displayName}</p>
    </div>
  );
};

const UserDataFetcher = () => {
  
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const isOpen = true;
  const isExpanded = true;
  const descriptionRef = useRef<HTMLDivElement>(null)
  const initialRequirementsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('https://api.guild.xyz/v2/guilds/guild-page/thecreators')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])
 
  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No profile data</p>
  
  const role: Role = (data as Guild).roles[14];

  return (
    <>
      <RoleRequirements
        {...{
          data,
          isOpen,
          isExpanded,
          undefined,
          descriptionRef,
          initialRequirementsRef,
        }}
      />
    </>
  );
};

export default UserDataFetcher;
