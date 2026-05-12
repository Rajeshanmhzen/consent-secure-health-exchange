import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './Context/ThemeContext'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { RouterProvider } from 'react-router-dom'
import router from './routes/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <MantineProvider>
        <Notifications position='bottom-right'/>
        <RouterProvider router={router}/> 
    </MantineProvider>
    </ThemeProvider>
  </StrictMode>,
)
