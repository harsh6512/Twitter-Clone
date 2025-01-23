import React from 'react';
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';

import SideBar from './components/common/SideBar';
import RightPanel from './components/common/RightPanel';

import NotificationPage from './pages/notification/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/common/LoadingSpinner';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';

function App() {
	const {data:authUser,isLoading}=useQuery({
		queryKey:["authUser"],
		queryFn:async()=>{
			try {
				const res=await fetch("/api/auth/me");
				const data=await res.json();
				if(data.success === false) return null;
				if(!res.ok){
					throw new Error(data.message ||"Something went wrong"
					)
				}
				console.log("authUser is here;",data)
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		retry:false,
	});

	if (isLoading) {
		return (
			<div className='h-screen flex justify-center items-center'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}


  return (
    <div className='flex max-w-6xl mx-auto'>
			{authUser && <SideBar />}
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to='/login' />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to='/' />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to='/' />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to='/login' />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to='/login' />} />
			</Routes>
			{authUser && <RightPanel />}
			<Toaster/>
		</div>
  );
}

export default App;
