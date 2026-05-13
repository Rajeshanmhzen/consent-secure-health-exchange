import {createBrowserRouter} from 'react-router-dom';
import App from '../App';
import Login from '../pages/Auth/login';
import Home from '../pages/home';
import Register from '../pages/Auth/register';

const router = createBrowserRouter ([
    {
        path: '/',
        element: <App />,
        children:[
            {
                path: '/',
                index: true,
                element: <Home />
            },
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            },
        ]
    }
])

export default router;