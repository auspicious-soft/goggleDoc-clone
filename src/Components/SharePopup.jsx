import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from '@mui/icons-material';

function SharePopup({ show, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    const sendEmailRequest = async () => {
      if (sendEmail) {
        try {
          const data = { 
            email: email,
            link: currentUrl
          };

          await axios.post(SENDEMAIL, data, {
            headers: {
              'Content-Type': 'application/json',
            }
          });

          setMessage('Email sent successfully!');
        } catch (error) {
          console.error('Error sending email:', error);
          setMessage('Failed to send email.');
        } finally {
          setSendEmail(false);
        }
      }
    };

    sendEmailRequest();
  }, [sendEmail, email, currentUrl]);

  useEffect(() => {
    if (message === 'Email sent successfully!') {
      const timer = setTimeout(() => {
        setMessage('');
        onClose(); // Hide the popup after 1 second if the email was sent successfully
      }, 1000);

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts or message changes
    } else if (message === 'Failed to send email.' || message === 'Link copied' || message === 'Failed to copy the link.') {
      const timer = setTimeout(() => {
        setMessage('');
      }, 1000);

      return () => clearTimeout(timer); // Cleanup the timer if the component unmounts or message changes
    }
  }, [message, onClose]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSendEmail(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setMessage('Link copied'); 
      setTimeout(() => { 
        setMessage('');
      }, 1000); 
    }).catch(err => {
      console.error('Failed to copy the text to clipboard:', err);
      setMessage('Failed to copy the link.');
      setTimeout(() => { 
        setMessage('');
      }, 1000); 
    });
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[12] py-10 bg-[#000] bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-[600px] w-[95%] relative">
        <div className="text-right absolute -top-0.5 -right-0.5">
          <button className="bg-black text-white rounded-[50%] w-[30px] h-[30px]" onClick={onClose}>X</button> 
        </div>
  
        <form onSubmit={handleSubmit}>
          <label className="my-2 font-[500] text-[#1f1f1f] text-[18px] mb-2 block mt-0"> 
              Share Document: 
          </label>
          <input
            className="border-[1px] border-[#5f6368] text-[#5f6368] text-[14px] w-full h-[50px] px-3 rounded-lg"
            type="email"
            value={email}
            placeholder='Add people, groups'
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className='flex justify-between align-middle mt-10'>
            <button 
              className="bg-[#fff] text-[14px] text-[#5f6368] border-[1px] border-[#5f6368] rounded-full px-6 py-[8px] leading-relaxed" 
              type="button" 
              onClick={handleCopyLink}
            >
              <Link style={{ fontSize: 18 }}/> Copy link
            </button>
            <button 
              className="bg-[#0b57d0] text-[14px] text-white border-0 rounded-full px-6 py-[8px] leading-relaxed" 
              type="submit"
            >
              Done
            </button>
          </div>
        </form>
        {message && <p className='absolute left-[50%] bottom-[-10px] translate-x-[-50%] bg-black px-6 py-2 text-[#fff] text-[14px]'>{message}</p>}
      </div>
    </div>
  );
}

export default SharePopup;
