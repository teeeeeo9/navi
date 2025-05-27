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
        "title": "About Navi: Your Strategic Thinking Partner",
        "content": """
        ## What is Navi?

        Navi is your dedicated thinking partner - a digital strategic mastermind designed to help you clarify your priorities, set meaningful goals, and navigate the path to achieving them. Unlike typical productivity apps that focus on task management, Navi focuses on the bigger picture: your strategic direction and meaningful accomplishments.

        Navi combines the warmth and wisdom of a trusted mentor with cutting-edge AI technology to provide personalized strategic guidance whenever you need it.

        ## How Navi Works

        Navi works through a natural conversational interface. Rather than filling out forms or navigating complex menus, you simply chat with Navi as you would with a trusted advisor. Behind the scenes, Navi:

        1. **Understands your goals**: Through conversation, Navi helps you articulate what you truly want to accomplish
        2. **Structures your thinking**: Helps break down ambitious goals into achievable milestones
        3. **Promotes reflection**: Guides you through important reflections about importance, obstacles, and strategies
        4. **Tracks progress**: Maintains a visual record of your journey toward each goal
        5. **Adapts to you**: Gets to know your communication style, priorities, and patterns over time

        Navi integrates seamlessly between its chat interface and visual elements. You can interact through conversation or directly with the visual representations of your goals.

        ## How to Use Navi

        **Getting Started:**
        - Begin by simply chatting with Navi about what you'd like to accomplish
        - Be open about your aspirations - Navi isn't judgmental and works with goals of any size
        - Allow Navi to guide you through important reflections about your goals

        **Regular Use:**
        - Check in regularly to update your progress
        - Use Navi for both quick progress updates and deeper strategic reviews
        - Interact with visual elements to update goals, milestones, and progress
        - Reflect with Navi on what's working and what could be improved

        **Best Practices:**
        - Be honest about both successes and challenges
        - Use Navi to reflect before, during, and after goal pursuit
        - Leverage Navi's ability to remember previous conversations and insights
        - Treat Navi as a thinking partner rather than just a tool

        ## Why Use Navi

        In a world of endless distractions and information overload, Navi helps you:

        - **Find clarity**: Cut through the noise to identify what truly matters to you
        - **Maintain focus**: Keep your attention on high-impact goals rather than endless tasks
        - **Develop strategy**: Think more deeply about how to approach your most important aims
        - **Build momentum**: Create and visualize progress toward meaningful accomplishments
        - **Learn and grow**: Reflect effectively on your approaches and outcomes
        - **Save time**: Skip complex productivity systems for a more intuitive approach

        Navi isn't about doing more things - it's about doing the right things. It's designed for people who want to make significant progress on what truly matters rather than just staying busy.
        """,
        "description": "Important: Overview of Navi as a strategic thinking partner, how it works, and its benefits",
        "tags": ["important", "navi", "overview", "introduction", "benefits", "usage"]
    },  
    {
        "title": "Navi's strategic Reflection Types",
        "content": """
        Strategic reflections are a core component of effective goal setting and achievement. These structured reflection types help users gain deeper insights and develop more robust strategies:

        1. Importance Reflection:
           - Purpose: To clarify why a goal matters personally to the user
           - Timing: Usually discussed before starting work on the goal
           - Key Questions: What will you gain when you achieve this goal? How does it align with your values? What meaningful changes will it bring?
           - Benefits: Creates intrinsic motivation, helps maintain commitment during challenges

        2. Obstacles Reflection:
           - Purpose: To identify and prepare for potential challenges
           - Timing: Typically discussed before starting work on the goal or during execution when new information emerges
           - Key Questions: What might prevent success? What unexpected outcomes could arise? How can these challenges be addressed?
           - Benefits: Creates preparedness, reduces surprise setbacks, builds contingency thinking

        3. Environment Reflection:
           - Purpose: To optimize your surroundings for goal achievement
           - Timing: Usually discussed before starting work on the goal
           - Key Questions: What setup will maximize success? What changes to your physical, digital, or social environment are needed?
           - Benefits: Reduces friction, creates supportive conditions for success

        4. Timeline Reflection:
           - Purpose: To establish and evaluate realistic timeframes
           - Timing: Before starting (is the timeline realistic?), during execution (are you on track?), and after completion (why was the timeline accurate or inaccurate?)
           - Key Questions: Is your timeline realistic, optimistic, or pessimistic? Are you keeping pace? If deadlines were missed, why?
           - Benefits: Improves planning accuracy, identifies process improvements

        5. Backup Plans Reflection:
           - Purpose: To develop contingency strategies
           - Timing: Usually discussed before starting work on the goal
           - Key Questions: What alternatives exist if your primary approach fails? What are the pros and cons of each backup option?
           - Benefits: Creates resilience, reduces anxiety, provides clear pivoting options

        6. Positive Review Reflection:
           - Purpose: To recognize successes and effective strategies
           - Timing: During execution or after completion
           - Key Questions: What went well? What effective approaches did you use? What strengths did you leverage?
           - Benefits: Builds confidence, reinforces effective behaviors, creates positive momentum

        7. Improvement Review Reflection:
           - Purpose: To identify growth opportunities
           - Timing: During execution or after completion
           - Key Questions: What could have gone better? What would you do differently next time? What lessons have you learned?
           - Benefits: Promotes continuous learning, improves future goal achievement

        Regular engagement with these reflection types throughout the goal journey leads to more thoughtful strategies, higher completion rates, and more meaningful growth experiences.
        """,
        "description": "Important: Navi's different types of strategic reflections for goal setting",
        "tags": ["important", "navi" ]
    },      
{
        "title": "Navi's Goal Tracking Framework",
        "content": """
       Goal tracking in Navi is conducted through a few key dimensions to ensure a comprehensive overview of progress. The primary dimensions for tracking are:

        1.  **Progress State (0-10)**: A snapshot of the current completion status of a goal or milestone.
        2.  **Effort Level (0-10)**: The amount of effort currently being invested in a goal or milestone.

        These progress metrics are dynamic and non-linear, allowing for a realistic representation of complex goals. They can be applied to both the overall goal and its individual milestones. For a deeper strategic understanding of the user's journey, refer to "Navi's Strategic Reflection Types.

        """,
        "description": "Important: Navi's framework for tracking goals across multiple dimensions",
        "tags": ["important","navi", "tracking", "framework", "progress", "metrics"]
    },
    {
        "title": "Navi's Goal Management JSON Formats",
        "content": """
        The following JSON formats are used for goal management operations:

        1. Goal Creation:
        ```json
        {
            "action_type": "create_goal", 
            "data": {
                "title": "Goal Title", 
                "target_date": "YYYY-MM-DD", 
                "milestones": [
                    {"title": "Milestone 1", "target_date": "YYYY-MM-DD"}
                ], 
                "reflections": {
                    "importance": "Why this goal matters to the user", 
                    "obstacles": "User's brief input on potential challenges"
                }
            }
        }
        ```

        2. Goal Analysis & Reflection:
        ```json
        {
            "action_type": "save_reflections",
            "data": {
                "goal_id": "[goal_id]",
                "reflections": [
                    {
                        "type": "importance",
                        "content": "Why this aspect is particularly important now"
                    },
                    {
                        "type": "obstacles",
                        "content": "The essence of the user's reflection on obstacles"
                    },
                    {
                        "type": "timeline",
                        "content": "The user's thoughts on the timeline feasibility"
                    }
                ]
            }
        }
        ```

        3. Progress Update:
        ```json
        {
            "action_type": "update_progress",
            "data": {
                "goal_id": "[goal_id]",
                "milestone_id": "[optional_milestone_id_if_specific]",
                "type": "progress|effort",
                "value": 7,
                "notes": "User's notes or summary of their update"
            }
        }
        ```

        4. Milestone Update:
        ```json
        {
            "action_type": "update_milestone", 
            "data": {
                "goal_id": "[goal_id]", 
                "milestone_id": "[milestone_id]", 
                "status": "completed|pending|missed|in_progress"
            }
        }
        ```

        5. Goal Update:
        ```json
        {
            "action_type": "update_goal",
            "data": {
                "goal_id": "[goal_id]",
                "title": "Updated Goal Title",
                "target_date": "YYYY-MM-DD",
                "status": "active|completed|abandoned|deferred",
                "reflections": {
                    "importance": "Updated reflection on importance",
                    "obstacles": "Updated reflection on obstacles"
                }
            }
        }
        ```
        
        These JSON formats enable structured interaction with the goal management system while maintaining flexibility for varying levels of detail in user input.
        """,
        "description": "Important: Navi's Standard JSON formats for goal management operations",
        "tags": ["important", "json", "api", "navi"]
    }
]

def get_knowledge_base_entries():
    """
    Get all knowledge base entries for training the replica.
    
    Returns:
        List[Dict]: List of knowledge base entry dictionaries
    """
    return STRATEGIC_PLANNING_ENTRIES 