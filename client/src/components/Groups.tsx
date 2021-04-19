import './Groups.scss';
import React, { FC, useEffect } from 'react';
import { ReactSVG } from 'react-svg';
import Form from 'react-bootstrap/Form';

import useAuth from '../hooks/useAuth';
import { useSelector, useDispatch, actions } from '../store';

const Groups: FC = () => {
  const dispatch = useDispatch();
  const { request, loading } = useAuth();
  const { user, error } = useSelector((state) => state);

  useEffect(() => {
    request('/load').then(({ response, error }) => {
      if (error) return console.log(error);

      console.log(22, response);
    });
  }, [request]);

  return <div className="Groups"></div>;
};

export default Groups;
