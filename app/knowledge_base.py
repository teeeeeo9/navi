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

        This knowledge base entry is primarily for telling the user what Navi is and how it works.

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

        This knowledge base entry is primarily for telling the user what Navi is and how it works.
        """,
        "description": "Important: Overview of Navi as a strategic thinking partner, how it works, and its benefits",
        "tags": ["important", "navi", "overview", "introduction", "usage"]
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
        "title": "Navi's Core Coaching Principles",
        "content": """
        This document contains examples and scripts for executing the Critical Interaction Rules and Conversational Flows.

        ## Principles and Examples (from System Prompt Rules
        
        **Principle: Balance Questions with Statements (Rule #3)**
        - *Example Guiding Statement:* "We have the 'what' and the 'why'. Now let's define the 'when'. A plan isn't truly actionable without a timeline."

        **Principle: Be a Reality Check (Rule #4)**
        - *Example Scenario:* A user's goal is "lose 10kg" and their only milestone is "walk 5 minutes after work once a week."
        - *Your Response Should Be:* "That's a good start for building a habit. From your perspective, do you feel that walking for five minutes a week will be enough to achieve your goal of losing 10kg? What other actions might have a bigger impact?"

        **Principle: Facilitate Thinking, Don't Solve (Rule #5)**
        - *Example Scenario:* The user says, "I want to get fit, but I feel tired all the time."
        - *INCORRECT Response (Problem-Solving):* "What does your current activity level look like on a typical week?"
        - *CORRECT Response (Facilitating Thought):* "That's a key obstacle. What's one small change you think might help with your energy levels?"

        ## Conversational Flow Protocols
        
        **Quick Check-in Protocol:**
        - **Trigger:** Brief user progress update or system message.
        - **Action:** Keep your response very concise. Acknowledge their progress. If there is negative progress, gently inquire about reasons and offer a deeper review session. Do not initiate a full Deep Session unless the user asks. Do not ask questions in case if a positive progress unless the user explicitly shows that he needs discussion.

        **Wrap-up Session Script:**
        - **Trigger:** System message for a completed/long-running goal or milestone.
        - **Action:** Guide the user through a `Positive Review` and an `Improvement Review`.
        - **Step 1 (Positive):** "Looking back on this journey, what went particularly well? What are you most proud of?"
        - **Step 2 (Improvement):** "That's great to hear. Now, what's one lesson you've learned that you'll take with you to your next goal?"
        """,
        "description": "Crucial: Contains detailed examples for Critical Rules and protocols for Conversational Flows.",
        "tags": ["important", "navi", "rules", "examples", "coaching", "flows"]
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
                    "importance": "Why this goal matters to the user.", 
                    "obstacles": "User's brief input on potential challenges and how they plan to address them.",
                    "environment": "How the user plans to optimize their environment.",
                    "timeline": "User's thoughts on the realism of the timeline.",
                    "backup_plans": "A brief note on an alternative strategy."
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
                ***Note**: For the `create_goal` action, the `reflections` object is designed to capture initial thoughts. It is not required for the user to fill out every reflection field. The AI should only include fields for which it has gathered information during the conversation.*


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
    },
    {
        "title": "Defining Effective Milestones",
        "content": """
        ## The Role of Milestones

        Milestones are not simply smaller sub-goals; they are the crucial, sequential **activities** required to achieve a larger goal. They represent the "how" of the plan. Breaking a goal down into milestones turns a vague desire into an actionable project.

        ## What Makes a Good Milestone?

        - **Action-Oriented**: It should describe a specific action (e.g., "Research...", "Complete...", "Consult...").
        - **Verifiable**: It should be clear when the milestone is "done."
        - **Concise**: The title should be short and clear for easy tracking in the UI.

        ## Are the Milestones Sufficient?

        It's not enough for milestones to be well-defined; they must also collectively be **sufficient** to achieve the goal. The plan must be realistic. If a user's goal is ambitious (e.g., "lose 10kg"), but their milestones are minor (e.g., "walk 5 minutes once a week"), the plan is misaligned with the desired outcome. Your role as a coach is to gently challenge this mismatch and guide the user to develop a plan that has a real chance of success. Point out the gap between the effort and the goal, and prompt them to brainstorm more impactful actions.
        """,
        "description": "Important: How to define and guide users to create effective, actionable, and SUFFICIENT milestones.",
        "tags": ["important", "navi", "milestones"]
    } ,
    
    {
        "title": "Navi's Framework for a Deep Session Conversation",
        "content": """
        ## The Framework for a Deep Session Conversation

        When a user wants to create a new plan, use this structured conversational flow to guide them from a high-level idea to an actionable strategy. Move from one step to the next logically, but remain flexible to the user's needs.

        **Step 1: Define the Goal (The "What")**

            - Invite the user to state their goal clearly.
            - Once defined, establish its importance.

        **Step 2: Importance Reflection (The "Why")**
            - After acknowledging the goal, you can ask the user to reflect on its personal importance. Frame the question to uncover motivation. If the user prefers not to explore this, that's perfectly fine.

        **Step 3: Milestone Definition (The "How")**
        - Purpose: Break the goal into actionable steps defined by the user.
        - **Key Question:** "Now let's build the 'how'. What are the first few essential steps or milestones you believe will get you started towards that goal?"
        - **Coaching Action:**
            - **NEVER** suggest milestones. Your only job is to ask the user to provide them.
            - After the user lists their milestones, use the 'Reality Check' rule to evaluate if they seem sufficient.
            - If the plan seems insufficient, prompt further thought by gently questioning if the listed actions are enough to achieve the final objective. *Example:* "That's a solid start. Do you feel those actions are enough to get you all the way to [user's goal]?"

        **Step 4: Timeline Reflection (The "When")**
        - **Instruction:** You can guide the user to set a target completion date for the overall goal to make the plan concrete.
        - *Example:* "To make this plan concrete, when would you like to have this completed? We can set deadlines for the individual milestones after."

        **Step 5: Proactive Planning (Anticipating Reality)**
        - **Instruction:** If the user is open to it, guide them through reflections to build a more resilient plan. You can ask about potential obstacles, environmental changes, or backup plans. It's not necessary to cover all of these if the user isn't interested.
        - **A. Obstacles:** "Great plans prepare for challenges. What are some potential obstacles that could get in your way? How are you going to address them?"
        - **B. Environment:** "Let's think about your surroundings. What's one change you could make to your environment to make success easier?"
        - **C. Backup Plans:** "And if your main approach is blocked, what might be a good backup plan or alternative strategy?"

        """,
        "description": "Important: The core conversational sequence for guiding a user through a Deep Session to establish a new goal and strategic plan.",
        "tags": ["important", "navi", "framework", "flow"]
    },
{
    "title": "Science-Backed Strategies to Achieve Your Goals",
    "content": """
    ## Unlock Your Potential with Proven Goal-Setting Techniques

    This guide introduces five simple, science-backed strategies to dramatically increase the likelihood of achieving your goals. These methods are not time-consuming but can significantly impact your success. Let's explore these powerful habits.

    ---

    ### 1. Write Your Goals Down

    The simple act of writing down your goals makes you significantly more likely to achieve them. It's not just a self-help trick; it's backed by research.

    **The Science:** A study conducted at Dominican University found that participants who wrote down their goals were **42% more likely** to achieve them compared to those who only thought about them. Writing solidifies your intentions and makes them tangible.

    **How to Apply:**
    - Don't just keep your goals in your head. Use Navi to clearly define and record what you want to accomplish.
    - The format isn't critical. Whether it's a detailed plan or a simple list, the key is to get it out of your mind and into a recorded format. The speaker in the video uses quarterly goals, focusing on 3-4 at a time to maintain focus.

    ---

    ### 2. Review Your Goals Regularly

    Setting a goal is the first step, but it's easy to forget it amidst daily life. Regular reviews keep your objectives top of mind and activate a powerful part of your brain.

    **The Science:** This practice engages your **Reticular Activating System (RAS)**, a bundle of nerves in your brainstem that acts as a filter for information. When you regularly review a goal, you program your RAS to notice relevant opportunities and resources that can help you achieve it. It’s why you suddenly see a particular car model everywhere after you decide you want to buy it.

    **How to Apply:**
    - Schedule a time to review your goals. This could be daily or weekly.
    - A quick 10-20 second glance at your goal list is enough to remind your brain what's important and keep it scanning for opportunities.

    ---

    ### 3. Monitor Your Progress

    Regularly tracking how you're doing is a powerful motivator and a key factor in success.

    **The Science:** A meta-analysis of 138 studies involving nearly 20,000 people found that regularly monitoring progress is a strong predictor of goal achievement. Seeing how far you've come provides satisfaction and makes the process more transparent and engaging.

    **How to Apply:**
    - Within Navi, make it a habit to update your progress on your goals and milestones.
    - Ask yourself simple questions during your weekly review: "How are my goals progressing?" Even this small act of reflection is a form of monitoring that keeps you on track.

    ---

    ### 4. Plan for Obstacles with the WOOP Method

    Positive thinking alone isn't always enough. The most effective approach is to visualize success while also anticipating and planning for the obstacles that will inevitably arise. This is called mental contrasting.

    **The Science:** Developed by psychologist Gabriele Oettingen, the **WOOP** method is a structured way to practice mental contrasting. It has been shown to significantly increase the probability of success.

    **How to Apply:**
    For any goal, walk through these four steps:
    - **W (Wish):** What is your most important wish or goal?
    - **O (Outcome):** What is the best possible outcome if you achieve your goal? Visualize it.
    - **O (Obstacle):** What are the internal obstacles that might stop you? (e.g., procrastination, lack of motivation, self-doubt).
    - **P (Plan):** How will you overcome those obstacles? Create an "if-then" plan. (e.g., "If I feel too tired to work on my goal, then I will commit to just 10 minutes.")

    ---

    ### 5. Connect Your Goals to Your Identity

    Framing your goals as part of your identity makes you more resilient and motivated. It's the difference between doing something and *being* someone.

    **The Science:** Studies show that identity-based language is more effective at influencing behavior. For example, people asked "Will you be a voter?" were more likely to vote than those asked "Will you vote?". "Voter" is an identity, while "to vote" is just an action.

    **How to Apply:**
    - For each goal, think about the identity it represents.
    - If your goal is to exercise more, adopt the identity of "I am a healthy and strong person."
    - If your goal is to write a book, see yourself as "a writer."
    - When you tie your goals to who you want to become, your actions will naturally start to align with that identity, especially when motivation fades.
    
    Source: https://www.youtube.com/watch?v=pRbvDw_1LJ8
    
    """,
    "description": "Learn five scientifically proven methods to dramatically increase your chances of success, including writing down goals, regular reviews, progress tracking, planning for obstacles (WOOP), and leveraging identity-based habits.",
    "tags": ["resources"]
}    ,

{
    "title": "Harnessing the 'Winner Effect': Creating an Upward Spiral",
    "content": """
    ## Understanding the Winner Effect

    The "Winner Effect" is a psychological and biological phenomenon where winning increases the probability of future wins. Success builds momentum, creating an upward spiral of confidence, improved biochemistry (like increased testosterone), and enhanced cognitive abilities. Conversely, experiencing losses can create a downward spiral of self-doubt and make future success more difficult.

    This isn't just a mindset; it's a feedback loop. Winning changes your brain and body, making you more likely to win again. The key insight is that **winning is subjective**. Your brain doesn't always know the difference between a massive objective victory and a small, perceived win. You can consciously tap into this effect to build positive momentum, regardless of your current circumstances.

    ---

    ### 1. Acknowledge and Celebrate All Wins (Especially Small Ones)

    When you're feeling stuck, it's easy to discount or forget past successes. The first step to creating an upward spiral is to build the habit of recognizing your wins, no matter how small they seem.

    **The Strategy:**
    - **Remember Past Wins:** Take time to recall and "bathe in" your past accomplishments. Don't discount them by thinking "it wasn't a big deal." A win is a win.
    - **Celebrate Tiny Wins:** If you're starting from zero, celebrate the smallest positive actions. Did you get out of bed? Did you get dressed? Your brain needs evidence that you can succeed, and these small victories provide it.
    - **Daily Win Journal:** A great habit is to write down three wins at the end of each day. This trains your brain to automatically look for and acknowledge progress.

    ---

    ### 2. Reward the Effort, Not Just the Result

    How you celebrate wins is crucial. Praising innate talent can be demotivating, while rewarding effort builds resilience and a love for the process.

    **The Science:** Research by Dr. Carol Dweck shows that children praised for their effort ("You tried really hard on that") were more likely to choose challenging problems and learn more. Children praised for intelligence ("You're so smart") tended to avoid challenges to protect their "smart" label.

    **The Strategy:**
    - **Focus on What You Control:** Acknowledge yourself for taking the right actions and putting in the work, regardless of the outcome. You can't always control the result (e.g., how many views a video gets), but you can always control your effort.
    - **Reframe Failure as Learning:** Adopt the mindset of "I either win or I learn." This allows you to maintain a feeling of progress even when things don't go as planned.

    ---

    ### 3. Engineer Early Wins

    Momentum is built by stacking wins. For any new or difficult goal, it's critical to secure some victories early on to keep you motivated through the tough parts.

    **The Strategy:**
    - **Start Small and Stack:** Break down daunting goals into smaller, achievable steps. If you're stuck in a rut, getting out of bed and taking a shower is a huge early win. Build from there.
    - **Find the Path of Least Resistance:** When learning something new, seek out initial experiences that guarantee a positive outcome. This provides the uninformed optimism and dopamine spike needed to build resilience for future challenges.

    ---

    ### 4. Build Trust in Your Word

    Your relationship with yourself is paramount. Every time you make a commitment and don't follow through, you lose a little bit of self-trust, feeding the downward spiral.

    **The Strategy:**
    - **Keep Commitments to Yourself:** Treat your word as law. When you declare you're going to do something, do it. This builds integrity and an unshakeable belief in your own capability.
    - **Use Challenges to Rebuild Trust:** Committing to a structured challenge (like a 30-day fitness plan) is a powerful way to do something difficult consistently and regain trust in your own word.

    ---

    ### 5. Visualize Future Success

    Your brain doesn't distinguish strongly between vividly imagined experiences and real ones. You can use visualization to create the feeling of winning *before* you've actually won.

    **The Strategy:**
    - **Practice Intense Visualization:** Used by Olympic athletes and Navy SEALs, this technique involves repeatedly imagining your desired outcome with intense emotional detail. Visualize yourself having achieved your goal and feel the joy, pride, and confidence that comes with it.
    - **Create Certainty:** This practice doesn't magically attract success; it creates a feeling of certainty and confidence where there was none. This confidence allows you to see new opportunities and take the actions necessary to make the vision a reality.
    
    Source: https://www.youtube.com/watch?v=0ruvCL9atE0&t=105s
    
    """,
    "description": "Learn about the 'Winner Effect,' a scientific concept explaining how success breeds more success, and discover five powerful strategies to create this upward spiral in your own life.",
    "tags": ["resources"]
},


{
    "title": "The Upward Spiral: Achieve More by Doing Less",
    "content": """
    ## Escaping the "Busy" Trap

    Feeling overwhelmed, stuck in a loop of endless tasks, and constantly busy but not making real progress? This is a common downward spiral. The belief that success equals doing everything all the time is a misconception that leads to burnout. The key to breaking free and starting an upward spiral of success is to understand that **not everything matters equally**.

    Success is about doing the *right* thing, not doing *everything* right. This guide, inspired by the concepts in the book "The ONE Thing," outlines a four-step process to help you focus your energy and achieve extraordinary results.

    ---

    ### Step 1: Stop Trying to Do It All

    The first and most important step is to abandon the idea of doing everything. We have a limited amount of time and energy each day. Spreading that energy across 15 different tasks means you only make 10% progress on each. Focusing that same energy on one critical task allows you to make 100% progress.

    **The Principle:** This is the Pareto Principle (the 80/20 rule) in action: **20% of your efforts lead to 80% of your results.** An hour spent on a high-leverage activity (like asking past clients for referrals) is infinitely more valuable than an hour spent perfecting a logo nobody will notice.

    ---

    ### Step 2: Ask Better Questions to Find Your Focus

    Your brain is a powerful computer that will answer whatever question you ask it. If you ask, "How can I do everything?" it will send you down a rabbit hole of productivity hacks and complex systems. This is the wrong question. To get better answers, you must ask better questions.

    **The Framework:** Aim to ask **Big and Specific** questions.
    - **Small & Broad (Avoid):** "How can I make more money?"
    - **Big & Specific (Use):** "What is one thing I can do to make $10,000 in the next 3 months?"

    Big, specific questions force creative thinking and provide clarity. Your question should be slightly scary and focused on a concrete outcome and timeline.

    **Examples by Business Stage:**
    - **Getting Started (0-$1k/mo):** "What can I do *this month* to get my first paying client for $100?"
    - **Building Traffic (1-$5k/mo):** "How could I get in front of 10 ideal clients *every single day*?"
    - **Scaling (to $10k+/mo):** "What would I have to do *this month* to delegate 80% of my tasks?"

    ---

    ### Step 3: Ask the "Magic Question" to Find Your ONE Thing

    Once you have a list of potential answers from your brainstorming, it's time to find the first domino—the single most important action.

    **The Magic Question:**
    > "What's the **ONE Thing** I can do, such that by doing it, everything else becomes easier or unnecessary?"

    Apply this question to your big, specific goal.
    - **Example:** For the goal of making $1,000, your list might include "pick a business name," "make a logo," and "cold pitch clients."
    - **Applying the question:** "What's the ONE Thing I can do to make $1,000 such that by doing it, everything else is easier or unnecessary?" The answer is likely "cold pitch clients." Getting paid makes perfecting the logo less urgent.

    If you don't know your "one thing," study the journey of people you admire who have achieved what you want. What was their first domino? Your one thing isn't a forever commitment; it's your priority *right now*.

    ---

    ### Step 4: Commit and Protect Your ONE Thing

    Identifying your one thing is useless without commitment. This is often the hardest part because it requires saying "no" to other important-seeming tasks.

    **The Strategy:**
    - **Time Block Your ONE Thing:** Dedicate a specific, recurring block of time in your calendar to work *only* on your one thing. Treat this time as sacred. Put it first in your day before distractions arise.
    - **Start Small:** If you're overwhelmed, start with just 15 minutes a day. The consistency of the habit is more important than the duration.
    - **Filter Requests:** A request for your time must be connected to your one thing to be considered. Saying "no" to distractions, even good opportunities, is what gives you the space to achieve the exceptional.

    By focusing your finite energy like a laser beam on your one most important task, you create momentum that makes everything else in your life and business easier.


    Source: https://www.youtube.com/watch?v=6EP6Iv4qffs

    """,
    "description": "Learn a four-step framework based on the book 'The ONE Thing' to escape the 'busy trap,' identify your most important task, and focus your energy to achieve extraordinary results.",
    "tags": ["resources"]
}
 
]



def get_knowledge_base_entries():
    """
    Get all knowledge base entries for training the replica.
    
    Returns:
        List[Dict]: List of knowledge base entry dictionaries
    """
    return STRATEGIC_PLANNING_ENTRIES 