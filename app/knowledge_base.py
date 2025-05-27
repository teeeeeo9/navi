"""
Knowledge base entries for training Sensay replicas.

This file contains the knowledge base entries used to train Sensay replicas
with strategic planning and goal-setting information.
"""

import logging

logger = logging.getLogger(__name__)

# Knowledge base entries for training strategic planning assistant
STRATEGIC_PLANNING_ENTRIES = [
    {
        "title": "SMART Goal Setting Framework",
        "content": """
        SMART is an acronym that stands for Specific, Measurable, Achievable, Relevant, and Time-bound. 
        
        Specific: A specific goal answers the questions: What exactly do I want to accomplish? Why is this important? Who is involved? Where will it happen?
        
        Measurable: A measurable goal includes criteria for tracking progress and knowing when you've achieved it. Ask: How much? How many? How will I know when it's accomplished?
        
        Achievable: An achievable goal is realistic and attainable. While it should stretch your abilities, it shouldn't be impossible. Consider: Do I have the resources and capabilities to achieve this goal? If not, what am I missing?
        
        Relevant: A relevant goal aligns with your broader objectives and matters to you. Ask: Why is this goal important? Does it align with other goals? Is this the right time?
        
        Time-bound: A time-bound goal has a deadline or specific timeframe. This creates urgency and helps prevent everyday tasks from taking priority over your longer-term goals. Ask: When do I want to achieve this? What can I do today, in six weeks, in six months?
        
        Using the SMART framework helps create well-defined goals that provide direction and motivation, track progress, and increase the likelihood of achievement.
        """,
        "description": "Comprehensive explanation of the SMART goal-setting framework",
        "tags": ["goal-setting", "strategy", "planning", "methodology"]
    },
    {
        "title": "Goal Reflection Best Practices",
        "content": """
        Regular reflection is essential for meaningful goal achievement. Here are key aspects to reflect on:
        
        Importance: Why is this goal important to you? How does it align with your values and long-term vision? What benefits will achieving this goal bring to your life?
        
        Obstacles: What potential challenges might you face? What resources do you need? What skills might you need to develop? What external factors could impact your progress?
        
        Environmental Setup: How can you modify your environment to support goal achievement? What distractions should you eliminate? What tools or resources do you need to have readily available?
        
        Timeline Management: Is your timeline realistic? Are there external deadlines to consider? Have you built in buffer time for unexpected delays? How will you track progress along the way?
        
        Backup Plans: What alternatives do you have if your primary approach doesn't work? What's your contingency plan if resources become unavailable? How flexible are you willing to be with your approach?
        
        Positive Review: What's working well in your approach? What strengths are you leveraging effectively? What small wins should you celebrate along the way?
        
        Areas for Improvement: What could be working better? What lessons have you learned so far? How might you adjust your approach moving forward?
        
        Reflection should be scheduled regularly - weekly for active projects, monthly for longer-term goals. Each reflection session should end with clear, actionable adjustments to your approach when needed.
        """,
        "description": "Best practices for goal reflection and strategic thinking",
        "tags": ["reflection", "strategy", "planning", "goals"]
    },
    {
        "title": "Milestone Planning Strategies",
        "content": """
        Effective milestone planning breaks down goals into manageable segments, providing clarity and motivation throughout your journey.
        
        Start with the End: Begin by clearly defining what "done" looks like for your goal.
        
        Work Backward: From your end goal, identify the major achievements needed to reach it.
        
        Size Appropriately: Each milestone should be substantial enough to feel meaningful but small enough to be achievable in a reasonable timeframe.
        
        Create Clear Criteria: Define specific, measurable criteria for each milestone to objectively determine when it's completed.
        
        Balance Dependencies: Arrange milestones to manage dependencies - ensure prerequisites are completed first.
        
        Set Realistic Timeframes: Allow sufficient time for each milestone, considering complexity, available resources, and potential setbacks.
        
        Build in Buffer Time: Add extra time between milestones to accommodate unexpected delays.
        
        Define Key Activities: For each milestone, identify the critical activities required for completion.
        
        Assign Responsibility: Clarify who is responsible for each milestone or component.
        
        Create Visibility: Keep milestones visible and track progress regularly.
        
        Celebrate Completion: Acknowledge and celebrate reaching each milestone to maintain motivation.
        
        Review and Adjust: Periodically review your milestone plan and adjust as needed based on progress and changing circumstances.
        
        Well-planned milestones provide a roadmap for your goal, breaking it down into achievable segments that each represent meaningful progress toward your ultimate objective.
        """,
        "description": "Strategic approaches to planning effective milestones for goals",
        "tags": ["milestones", "planning", "strategy", "goals"]
    },
    {
        "title": "Progress Tracking Methods",
        "content": """
        Effective progress tracking keeps you motivated and informed about your goal journey.
        
        Quantitative Tracking: 
        - Percentage completion (0-100%)
        - Numerical metrics (e.g., words written, sales made, weight lifted)
        - Binary checklists (completed/not completed)
        - Time spent on activities
        
        Qualitative Tracking:
        - Effort level assessment (low/medium/high)
        - Journal entries describing progress
        - Quality assessments of work completed
        - Mood or energy tracking related to the goal
        
        Visual Tracking Methods:
        - Progress bars
        - Charts and graphs
        - Kanban boards moving tasks through stages
        - Calendar tracking with color coding
        
        Frequency Considerations:
        - Daily tracking for habits and short-term goals
        - Weekly tracking for most professional and personal goals
        - Monthly tracking for longer-term goals
        - Quarterly reviews for annual goals
        
        Tracking Principles:
        - Make it easy - tracking should take minimal effort
        - Make it visible - progress should be readily apparent
        - Make it meaningful - track what actually matters
        - Make it consistent - use the same metrics throughout
        
        Tracking progress in both objective (quantitative) and subjective (qualitative) dimensions provides a more complete picture of your goal journey and helps maintain motivation even when measurable progress is temporarily stalled.
        """,
        "description": "Methods and best practices for tracking progress on goals",
        "tags": ["progress", "tracking", "metrics", "goals"]
    },
    {
        "title": "Overcoming Goal Obstacles",
        "content": """
        Obstacles are inevitable in any goal pursuit. Successful goal-achievers anticipate and effectively navigate challenges.
        
        Common Obstacles:
        - Limited time or resources
        - Lack of specific skills or knowledge
        - Competing priorities
        - Unexpected external events
        - Loss of motivation or focus
        - Insufficient social support
        - Fear of failure or success
        
        Obstacle Management Strategies:
        
        Anticipate: Identify potential obstacles before they arise. Ask: "What could prevent me from achieving this goal?"
        
        Analyze: For each obstacle, determine if it's within your control, partially within your control, or outside your control.
        
        Plan: Create specific strategies for obstacles within your control. For example, if limited time is an obstacle, identify specific time slots in your schedule dedicated to your goal.
        
        Buffer: Build flexibility into your timeline to accommodate unexpected delays.
        
        Skill Up: Identify skills you need to develop and incorporate learning into your goal plan.
        
        Create Support Systems: Enlist others who can provide accountability, expertise, or encouragement.
        
        Implementation Intentions: Create "if-then" plans for how you'll respond to specific obstacles. For example, "If I feel too tired to work on my goal after work, then I will take a 15-minute power nap first."
        
        Regular Review: Revisit and update your obstacle management strategies as you progress.
        
        Maintain Perspective: Remember that obstacles are part of the process, not indications of failure.
        
        By anticipating obstacles and having strategies ready, you can maintain momentum even when challenges arise.
        """,
        "description": "Strategies for anticipating and overcoming obstacles in goal pursuit",
        "tags": ["obstacles", "challenges", "solutions", "strategy"]
    },
    {
        "title": "Effective Goal Environment Design",
        "content": """
        Your environment significantly impacts your ability to achieve goals. Strategic environment design makes goal achievement easier and more natural.
        
        Physical Environment:
        - Minimize distractions relevant to your goal
        - Make needed tools and resources easily accessible
        - Create visual cues and reminders of your goals
        - Designate specific spaces for goal-related activities
        - Remove temptations that could derail progress
        
        Digital Environment:
        - Configure notifications to support rather than hinder focus
        - Organize digital files for easy access to goal materials
        - Use apps and tools specifically designed for your goal type
        - Create digital boundaries during focused work time
        - Leverage automation for routine aspects of your goal
        
        Social Environment:
        - Communicate your goals to supportive people
        - Seek out communities pursuing similar goals
        - Distance yourself from negative influences
        - Find accountability partners or mentors
        - Consider how your social commitments impact goal time
        
        Temporal Environment:
        - Identify and leverage your peak productivity hours
        - Block dedicated time for goal work
        - Create routines that naturally incorporate goal activities
        - Use timeboxing to maintain focus and prevent burnout
        - Schedule regular review and reflection sessions
        
        Environment design principles should be applied proactively and adjusted based on what actually works for you. The ideal environment removes friction from goal-related activities and adds friction to distractions and competing priorities.
        """,
        "description": "How to design your environment to support goal achievement",
        "tags": ["environment", "productivity", "habits", "systems"]
    },
    {
        "title": "Strategic Goal Prioritization",
        "content": """
        When you have multiple goals, strategic prioritization ensures you focus your limited resources effectively.
        
        Prioritization Frameworks:
        
        Eisenhower Matrix:
        - Important and Urgent: Do these tasks immediately
        - Important but Not Urgent: Schedule dedicated time
        - Urgent but Not Important: Delegate if possible
        - Neither Urgent nor Important: Eliminate
        
        Value vs. Effort Assessment:
        - High Value, Low Effort: Quick wins - do first
        - High Value, High Effort: Major projects - plan carefully
        - Low Value, Low Effort: Fill-in tasks - do when convenient
        - Low Value, High Effort: Avoid or eliminate
        
        Goal Alignment:
        - How does each goal support your long-term vision?
        - Which goals create leverage or enable other goals?
        - Which goals have the broadest positive impact?
        
        Resource Constraint Analysis:
        - Which goals compete for the same resources?
        - Where are your resources (time, energy, money) best applied?
        - Which goals have resource requirements that might change soon?
        
        Opportunity Cost Consideration:
        - What must you give up to pursue each goal?
        - Which goals, if delayed, would have the biggest negative impact?
        - Which goals have time-sensitive components?
        
        Strategic prioritization isn't a one-time activity but should be revisited regularly as circumstances change. It's better to achieve a few important goals fully than to make minimal progress on many goals simultaneously.
        """,
        "description": "Frameworks for strategically prioritizing multiple goals",
        "tags": ["prioritization", "strategy", "decision-making", "focus"]
    },
    {
        "title": "Adapting Goals to Changing Circumstances",
        "content": """
        Flexibility in goal pursuit is essential for long-term success. Knowing when and how to adapt your goals ensures you stay on track even as circumstances change.
        
        Signs Adaptation May Be Needed:
        - Consistent inability to make progress despite effort
        - Significant changes in available resources
        - New information that affects the goal's relevance or approach
        - Unexpected opportunities that align better with your core values
        - Repeated patterns of similar obstacles
        
        Adaptation Strategies:
        
        Scope Adjustment:
        - Expand the goal if it's proving too easy
        - Narrow the goal if it's proving too challenging
        - Maintain the core objective while changing the approach
        
        Timeline Modification:
        - Extend deadlines when external factors cause delays
        - Accelerate timelines when progress exceeds expectations
        - Break a goal into phases with separate timelines
        
        Resource Reallocation:
        - Identify new resources that could support the goal
        - Shift resources between different aspects of the goal
        - Reduce resource requirements through approach changes
        
        Strategic Pivoting:
        - Identify the core value behind your original goal
        - Explore alternative goals that serve the same core value
        - Evaluate whether a different goal better serves your needs now
        
        Adaptation vs. Abandonment:
        - Adaptation maintains commitment to core values and long-term vision
        - Adaptation is based on rational analysis, not emotional reactions
        - Adaptation looks for "both/and" solutions before "either/or" choices
        
        Skillful adaptation requires self-awareness, environmental awareness, and a clear understanding of why your goals matter to you in the first place. The most successful goal-setters maintain determination while remaining flexible about their specific approach.
        """,
        "description": "How to adapt goals appropriately when circumstances change",
        "tags": ["adaptability", "flexibility", "resilience", "strategy"]
    }
]

def get_knowledge_base_entries():
    """
    Get all knowledge base entries for training the replica.
    
    Returns:
        List[Dict]: List of knowledge base entry dictionaries
    """
    return STRATEGIC_PLANNING_ENTRIES 