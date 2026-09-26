'use client'
import { useEffect } from 'react'
export function SettingsSync({phone,greeting}:{phone:string;greeting:string}){useEffect(()=>{localStorage.setItem('shati-phone',phone.replace(/\D/g,''));localStorage.setItem('shati-greeting',greeting)},[phone,greeting]);return null}
