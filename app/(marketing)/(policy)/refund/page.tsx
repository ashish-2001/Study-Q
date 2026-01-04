'use client';

import Footer from '@/components/landing/footer';
import FooterCTA from '@/components/landing/footer-cta';
import { motion } from 'framer=motion';


function RefundAndCancellationPage(){
    return (
        <>
            <motion.main 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    duration: 0.5,
                    delay: 0.25,
                    type: 'string',
                    damping: 10,
                    stiffness: 100
                }}
                className='wrapper flex flex-col items-start justify-center'
            >
                <h1 className='mx-auto mb-8 w-full text-center text-4xl font-extrabold tracking-tighter text-primary md:mb-12 md:text-5xl'>
                    Refund/Cancellation Policy
                </h1>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: 0.5,
                        type: 'spring',
                        damping: 10,
                        stiffness: 100
                    }}
                    className='mx-auto max-w-3xl'
                >
                    <p className='text-lg font-medium text-foreground/80'>
                    You are entitled to a refund in the case of the purchase course not 
                    being assigned to you within the expiration date from your date of 
                    purchase or if you have paid twice for the same course.
                    Under any other circumstances, we will not consider any requests 
                    for the refund as this is a digital course purchase.
                    </p>
                </motion.div>
            </motion.main>
            <FooterCTA/>
            <Footer/>
        </>
    )
}

export default RefundAndCancellationPage;