import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const ContactSection = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await emailjs.send(
        'service_46d2uif',
        'template_5ij2xy6',
        {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          subject: form.subject,
          time: new Date().toLocaleString(),
          message: form.message,
        },
        'lFJlQCkrhVYA8b4L3'
      );
      setSuccess(true);
      setForm({ firstName: '', lastName: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return <section id="contact" className="py-24 relative overflow-hidden fade-in-section">
      <div className="mesh-grid absolute inset-0 opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-1.5 bg-gray-800 rounded-full mb-6 border border-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400 mr-2" />
            <span className="text-sm font-medium text-gray-300">
              Get in Touch
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Need Help? <span className="gradient-text">Contact Us</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            Our team is here to answer your questions and help you get the most
            out of selfinterview AI+.
          </p>
        </div>
        <div className="mt-16 flex justify-center">
          <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700 glass-effect w-full max-w-2xl p-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Send us a message
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="first-name" className="block text-sm font-medium text-gray-300">
                    First name
                  </label>
                  <div className="mt-1">
                    <input type="text" name="firstName" id="first-name" className="py-3 px-4 block w-full bg-gray-700 border-gray-600 rounded-md text-gray-300 focus:ring-violet-500 focus:border-violet-500" value={form.firstName} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-sm font-medium text-gray-300">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input type="text" name="lastName" id="last-name" className="py-3 px-4 block w-full bg-gray-700 border-gray-600 rounded-md text-gray-300 focus:ring-violet-500 focus:border-violet-500" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <div className="mt-1">
                    <input id="email" name="email" type="email" className="py-3 px-4 block w-full bg-gray-700 border-gray-600 rounded-md text-gray-300 focus:ring-violet-500 focus:border-violet-500" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                    Subject
                  </label>
                  <div className="mt-1">
                    <select id="subject" name="subject" className="py-3 px-4 block w-full bg-gray-700 border-gray-600 rounded-md text-gray-300 focus:ring-violet-500 focus:border-violet-500" value={form.subject} onChange={handleChange} required>
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Enterprise Plan</option>
                      <option>Feature Request</option>
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea id="message" name="message" rows={4} className="py-3 px-4 block w-full bg-gray-700 border-gray-600 rounded-md text-gray-300 focus:ring-violet-500 focus:border-violet-500" value={form.message} onChange={handleChange} required></textarea>
                  </div>
                </div>
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {success && <div className="text-green-400 text-sm">Thank you for contacting us! We have received your message and will get back to you soon.</div>}
              <div>
                <button type="submit" className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>;
};