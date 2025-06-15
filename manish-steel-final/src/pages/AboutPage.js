import React, { useState, useEffect } from 'react';
import { aboutAPI } from '../services/api';

const AboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Placeholder image for fallback
  const placeholderImage = 'https://via.placeholder.com/600x400/0057A3/FFFFFF?text=About+Us';
  
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await aboutAPI.getContent();
        if (response.data && response.data.success) {
          setAboutData(response.data.data);
        } else {
          setError('Failed to fetch about page content');
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
        setError('Error loading content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAboutData();
  }, []);
  
  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 my-10">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="bg-primary text-white py-16">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {aboutData?.heroTitle || "About Our Company"}
              </h1>
              <p className="text-lg md:text-xl max-w-3xl">
                {aboutData?.heroDescription || 
                  "Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal, dedicated to providing durable and stylish solutions for homes and offices."}
              </p>
            </div>
          </section>
          
          {/* Company Introduction */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                  <img 
                    src={aboutData?.storyImage || placeholderImage} 
                    alt="Our Company" 
                    className="rounded-lg shadow-md w-full" 
                  />
                </div>
                <div className="md:w-1/2">
                  <h2 className="section-title">{aboutData?.storyTitle || "Our Story"}</h2>
                  {aboutData?.storyContent ? (
                    aboutData.storyContent.map((paragraph, idx) => (
                      <p key={idx} className="mb-4">
                        {paragraph}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="mb-4">
                        Founded over a decade ago, Shree Manish Steel Furnitry Industry began with a simple mission: to create high-quality, affordable furniture for Nepali homes and businesses. What started as a small workshop has grown into one of the most trusted furniture manufacturers in the region.
                      </p>
                      <p className="mb-4">
                        Our journey has been defined by a commitment to craftsmanship, innovation, and customer satisfaction. We take pride in our Nepali heritage and continue to support local communities through employment opportunities and sustainable business practices.
                      </p>
                      <p>
                        Today, we offer a comprehensive range of steel and wooden furniture solutions, from household almirahs to complete office setups, all designed with the unique needs of our customers in mind.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>
          
          {/* Vision & Mission */}
          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vision */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Our Vision</h3>
                  <p className="text-text/80">
                    {aboutData?.vision || "To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service. We envision a future where every Nepali home and office is furnished with our durable, stylish, and affordable products."}
                  </p>
                </div>
                
                {/* Mission */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Our Mission</h3>
                  <p className="text-text/80">
                    {aboutData?.mission || "To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices. We are committed to using quality materials, employing skilled craftsmen, and maintaining high standards of production to deliver products that exceed customer expectations."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      
      
      {/* Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-12">Our Core Values</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutData?.coreValues && aboutData.coreValues.length > 0 ? (
              aboutData.coreValues.map((value, idx) => (
                <div key={idx} className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {/* We're using simple SVG icons here, in a real implementation you would map icon names to components */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">{value.title}</h3>
                  <p className="text-text/80">
                    {value.description}
                  </p>
                </div>
              ))
            ) : (
              // Default values if none are provided from the API
              <>
                {/* Quality */}
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Quality</h3>
                  <p className="text-text/80">
                    We never compromise on the quality of our materials or craftsmanship, ensuring products that last for generations.
                  </p>
                </div>
                
                {/* Innovation */}
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Innovation</h3>
                  <p className="text-text/80">
                    We continuously explore new designs, technologies, and processes to improve our products and meet evolving customer needs.
                  </p>
                </div>
                
                {/* Integrity */}
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Integrity</h3>
                  <p className="text-text/80">
                    We conduct our business with honesty, transparency, and ethical practices, building trust with customers, employees, and partners.
                  </p>
                </div>
                
                {/* Customer Focus */}
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Customer Focus</h3>
                  <p className="text-text/80">
                    We prioritize customer satisfaction by listening to feedback, providing excellent service, and creating products that meet real needs.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Team/Factory Photos */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-center mb-8">
            {aboutData?.workshopTitle || "Our Workshop & Team"}
          </h2>
          <p className="section-subtitle text-center max-w-3xl mx-auto mb-12">
            {aboutData?.workshopDescription || 
              "Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture."}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aboutData?.workshopImages && aboutData.workshopImages.length > 0 ? (
              aboutData.workshopImages.map((image, idx) => (
                <div key={idx} className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={image} 
                    alt={`Workshop and Team ${idx + 1}`} 
                    className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))
            ) : (
              // Default placeholders if no images are provided
              [1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={placeholderImage} 
                    alt={`Workshop and Team ${item}`} 
                    className="w-full h-64 object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
