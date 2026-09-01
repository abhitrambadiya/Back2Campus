import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaLightbulb, FaCompass, FaHandshake, FaUsers } from "react-icons/fa";

const VisionaryContainer = styled.section`
  padding: ${({ theme }) => theme.spacing.section} 0;
  background: ${({ theme }) => theme.gradients.secondary};
  color: ${({ theme }) => theme.colors.textDark};
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/assets/backgrounds/visionary-bg.svg");
    background-size: cover;
    background-position: center;
    opacity: 0.1;
    z-index: 0;
  }
`;

const VisionaryInner = styled.div`
  position: relative;
  z-index: 1;
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
  color: ${({ theme }) => theme.colors.textDark};
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
    background: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.small};
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: ${({ theme }) => theme.fontSizes.large};
  color: "textDark";
  text-align: center;
  max-width: 700px;
  margin: 0 auto 60px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 60px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
  }
`;

const VisionMissionContainer = styled(motion.div)`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const VisionMissionCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 40px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;

  svg {
    font-size: 28px;
    color: ${({ theme }) => theme.colors.white};
  }
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin: 0;
`;

const CardContent = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  line-height: 1.6;
  color: "textDark";
  margin: 0;
`;

const ValuesContainer = styled(motion.div)`
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 40px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ValuesTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin: 0 0 30px;
  display: flex;
  align-items: center;

  svg {
    margin-right: 15px;
    font-size: 28px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ValuesList = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 25px;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ValueItem = styled(motion.div)`
  display: flex;
  align-items: flex-start;
`;

const ValueNumber = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xlarge};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-right: 15px;
  line-height: 1;
`;

const ValueContent = styled.div`
  flex: 1;
`;

const ValueName = styled.h4`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin: 0 0 8px;
`;

const ValueDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  line-height: 1.5;
  color: "textDark";
  margin: 0;
`;

const QuoteContainer = styled(motion.div)`
  margin-top: 60px;
  text-align: center;
  max-width: 800px;
`;

const QuoteText = styled.blockquote`
  font-size: ${({ theme }) => theme.fontSizes.llarge};
  font-style: italic;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textDark};
  margin: 0 0 20px;
  position: relative;
  padding: 0 40px;

  &:before,
  &:after {
    content: '"';
    font-size: 60px;
    color: ${({ theme }) => theme.colors.primary};
    position: absolute;
    font-family: Georgia, serif;
  }

  &:before {
    top: -20px;
    left: 0;
  }

  &:after {
    bottom: -40px;
    right: 0;
  }
`;

const QuoteAuthor = styled.cite`
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-style: normal;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: rgba(255, 255, 255, 0.9);
  display: block;
  margin-top: 30px;

  span {
    display: block;
    font-size: ${({ theme }) => theme.fontSizes.small};
    color: rgba(255, 255, 255, 0.7);
    margin-top: 5px;
  }
`;

const VisionarySection = () => {
  const [titleRef, titleInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [contentRef, contentInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [quoteRef, quoteInView] = useInView({
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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
      },
    }),
  };

  const valuesContainerVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6 },
    },
  };

  const valueItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1 + 0.3,
        duration: 0.5,
      },
    }),
  };

  const quoteVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7 },
    },
  };

  // Core values data
  const coreValues = [
    {
      id: 1,
      name: "Excellence",
      description:
        "Striving for the highest standards in all our endeavors and encouraging continuous improvement.",
    },
    {
      id: 2,
      name: "Integrity",
      description:
        "Maintaining ethical standards, transparency, and honesty in all our interactions and initiatives.",
    },
    {
      id: 3,
      name: "Collaboration",
      description:
        "Fostering partnerships and teamwork among alumni, students, faculty, and the broader community.",
    },
    {
      id: 4,
      name: "Innovation",
      description:
        "Embracing creative thinking and new approaches to address challenges and create opportunities.",
    },
  ];

  return (
    <VisionaryContainer id="vision">
      <VisionaryInner>
        <div ref={titleRef}>
          <SectionTitle
            variants={titleVariants}
            initial="hidden"
            animate={titleInView ? "visible" : "hidden"}
          >
            Our Vision & Mission
          </SectionTitle>

          <SectionSubtitle
            variants={subtitleVariants}
            initial="hidden"
            animate={titleInView ? "visible" : "hidden"}
          >
            Guiding principles that drive our Back2Campus forward and shape our
            initiatives
          </SectionSubtitle>
        </div>

        <ContentWrapper ref={contentRef}>
          <VisionMissionContainer>
            <VisionMissionCard
              variants={cardVariants}
              custom={0}
              initial="hidden"
              animate={contentInView ? "visible" : "hidden"}
            >
              <CardHeader>
                <IconWrapper>
                  <FaLightbulb />
                </IconWrapper>
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                To create a vibrant, engaged, and supportive global alumni
                community that fosters lifelong connections, contributes to the
                growth of our alma mater, and makes a positive impact on society
                through collaborative initiatives and knowledge sharing.
              </CardContent>
            </VisionMissionCard>

            <VisionMissionCard
              variants={cardVariants}
              custom={1}
              initial="hidden"
              animate={contentInView ? "visible" : "hidden"}
            >
              <CardHeader>
                <IconWrapper>
                  <FaCompass />
                </IconWrapper>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                To strengthen the bond between students and the alumni by
                creating meaningful engagement opportunities, facilitating
                networking and professional development, supporting current
                students through mentorship and scholarships, and promoting the
                institution's reputation and legacy worldwide.
              </CardContent>
            </VisionMissionCard>
          </VisionMissionContainer>

          <ValuesContainer
            variants={valuesContainerVariants}
            initial="hidden"
            animate={contentInView ? "visible" : "hidden"}
          >
            <ValuesTitle>
              <FaHandshake /> Our Core Values
            </ValuesTitle>

            <ValuesList>
              {coreValues.map((value, index) => (
                <ValueItem
                  key={value.id}
                  variants={valueItemVariants}
                  custom={index}
                  initial="hidden"
                  animate={contentInView ? "visible" : "hidden"}
                >
                  <ValueNumber>0{value.id}</ValueNumber>
                  <ValueContent>
                    <ValueName>{value.name}</ValueName>
                    <ValueDescription>{value.description}</ValueDescription>
                  </ValueContent>
                </ValueItem>
              ))}
            </ValuesList>
          </ValuesContainer>
        </ContentWrapper>

        <QuoteContainer
          ref={quoteRef}
          variants={quoteVariants}
          initial="hidden"
          animate={quoteInView ? "visible" : "hidden"}
        >
          <QuoteText>
            Our alumni network is not just about maintaining connections—it's
            about creating a community that continues to grow, learn, and
            contribute to society long after graduation.
          </QuoteText>
          {/* <QuoteAuthor>
            Dr. Rajesh Kumar
            <span>President, Back2Campus</span>
          </QuoteAuthor> */}
        </QuoteContainer>
      </VisionaryInner>
    </VisionaryContainer>
  );
};

export default VisionarySection;
