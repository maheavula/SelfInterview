import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Github, Youtube, BrainCircuit } from 'lucide-react';
export const Footer = () => {
  return <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-4">
            <BrainCircuit className="h-8 w-8 text-violet-500" />
            <span className="ml-2 text-2xl font-bold">
              <span className="text-white">self</span>
              <span className="gradient-text">interview</span>
              <span className="text-xs align-top ml-1 text-violet-500">
                AI+
              </span>
            </span>
          </div>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            selfinterview AI+ is the next generation of interview preparation,
            combining advanced neural networks with industry expertise to help
            you land your dream job.
          </p>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} selfinterview AI+. All rights
              reserved.
            </p>
            <span className="text-gray-400 text-sm">
            <span className="font-bold">  Created by K Janardhan Reddy & A Maheswar Reddy</span>
            </span>  
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400 text-sm">
                  All systems operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};