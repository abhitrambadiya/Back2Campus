import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaGraduationCap,
  FaHandshake,
  FaLightbulb,
  FaUsers,
} from "react-icons/fa";
import schoolImage from "../assets/pexels-poddar-school-2161580821-37954917.jpg";

const AboutContainer = styled.section`
  padding: 60px 0; /* Reduced padding to create less gap */
  background-color: #f9fafb; /* Off-white background to match gray-50 */
  position: relative;
  overflow: hidden;
`;

const AboutInner = styled.div`
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SectionTitle = styled(motion.h2)`
  font-size: ${({ theme }) => theme.fontSizes.xxxlarge};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 20px;
  text-align: center;
  position: relative;

  &:after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: ${({ theme }) => theme.gradients.primary};
    border-radius: ${({ theme }) => theme.borderRadius.small};
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
  max-width: 700px;
  margin: 0 auto 50px;
`;

const ContentWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
  margin-bottom: 50px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const ImageContainer = styled(motion.div)`
  flex: 1;
  position: relative;
  height: 450px; /* Increased height to accommodate full image */
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 15px; /* Reduced padding to give more space to image */

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Changed from cover to contain to show full image */
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadows.large};
    background-color: #f8f9fa; /* Light background for transparent areas */
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 70%,
      rgba(0, 0, 0, 0.7) 100%
    );
    z-index: 1;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    height: 350px; /* Adjusted for mobile */
    padding: 10px;
  }
`;

const TextContainer = styled(motion.div)`
  flex: 1;
`;

const AboutText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  line-height: 1.8;
  color: ${({ theme }) => theme.colors.textDark};
  margin-bottom: 20px;
`;

const HighlightText = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const FeaturesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  width: 100%;
  margin-top: 30px;
`;

const FeatureCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 30px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: ${({ theme }) => theme.transitions.default};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-10px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.white};
  font-size: 30px;
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 15px;
`;

const FeatureDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textLight};
  line-height: 1.6;
`;

const AboutSection = () => {
  const [titleRef, titleInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [contentRef, contentInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [featuresRef, featuresInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const titleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 },
    },
  };

  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.1 * i,
      },
    }),
  };

  const features = [
    {
      icon: <FaGraduationCap />,
      title: "Academic Excellence",
      description:
        "Promoting academic excellence through scholarships, mentorship programs, and educational resources.",
    },
    {
      icon: <FaHandshake />,
      title: "Networking Opportunities",
      description:
        "Connect with fellow alumni through events, reunions, and our online directory to expand your professional network.",
    },
    {
      icon: <FaLightbulb />,
      title: "Innovation & Research",
      description:
        "Supporting cutting-edge research and innovation initiatives to advance our field and create new opportunities.",
    },
    {
      icon: <FaUsers />,
      title: "Community Engagement",
      description:
        "Giving back to our community through volunteer programs, mentorship, and collaborative projects.",
    },
  ];

  return (
    <AboutContainer id="about">
      <AboutInner>
        <div ref={titleRef}>
          <SectionTitle
            variants={titleVariants}
            initial="hidden"
            animate={titleInView ? "visible" : "hidden"}
          >
            About Our Back2Campus
          </SectionTitle>

          <SectionSubtitle
            variants={subtitleVariants}
            initial="hidden"
            animate={titleInView ? "visible" : "hidden"}
          >
            Building a strong community of graduates dedicated to supporting
            each other and our alma mater
          </SectionSubtitle>
        </div>

        <ContentWrapper ref={contentRef}>
          <ImageContainer
            variants={imageVariants}
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
          >
            <img
              src={schoolImage}
              alt="School"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </ImageContainer>

          <TextContainer
            variants={textVariants}
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
          >
            <AboutText>
              Established as a sample institution,{" "}
              <HighlightText>Demo Engineering College</HighlightText> is a
              fictional campus created to showcase the features of this alumni
              networking platform. The platform demonstrates how students,
              graduates, and faculty can connect, share updates, explore
              opportunities, and stay engaged with their community.
            </AboutText>
            <AboutText>
              Our mission is to{" "}
              <HighlightText>build a connected campus community</HighlightText>{" "}
              by providing a space for networking, mentorship, career growth,
              and meaningful interactions between students, alumni, and faculty.
            </AboutText>
            <AboutText>
              Through this demo platform, users can explore events, connect with
              peers, discover opportunities, and experience how a modern alumni
              network can help strengthen relationships and support future
              academic and professional growth.
            </AboutText>
          </TextContainer>
        </ContentWrapper>

        <FeaturesContainer ref={featuresRef}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              custom={index}
              variants={featureVariants}
              initial="hidden"
              animate={featuresInView ? "visible" : "hidden"}
              whileHover={{ y: -10 }}
            >
              <FeatureIcon>{feature.icon}</FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesContainer>
      </AboutInner>
    </AboutContainer>
  );
};

export default AboutSection;
