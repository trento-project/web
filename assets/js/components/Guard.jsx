import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { setUserAsLogged } from '@state/user';
import { clearCredentialsFromStore } from '@lib/auth';

export default function Guard({ redirectPath, getUser }) {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    getUser()
      .then((trentoUser) => {
        setUser(trentoUser);
        setUserLoading(false);
        // If the user in the store is already loggedIn, means
        // that the store is hydrated so the guard is triggered on the spa full loaded
        // no dispatching of logged in action needed
        if (!loggedIn) {
          dispatch(setUserAsLogged());
        }
      })
      .catch(() => {
        setUserLoading(false);
        clearCredentialsFromStore();
      });
  }, [loggedIn]);

  useEffect(() => {
    if (!userLoading && !user) {
      const currentLocationPath = new URLSearchParams();
      currentLocationPath.append('request_path', window.location.pathname);
      navigate(`${redirectPath}?${currentLocationPath.toString()}`, {
        replace: true,
      });
    }
  }, [userLoading, user]);

  if (user) {
    return <Outlet />;
  }

  return null;
}
