import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate("/onboarding-form");
  }, [navigate]);
  
    return null;
} 