import { supabase } from './supabase';

export type QueryType = 'class' | 'event' | 'department' | 'faq' | 'unknown';

export interface ProcessedQuery {
  type: QueryType;
  keywords: string[];
  day?: string;
  department?: string;
  category?: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const CLASS_KEYWORDS = [
  'class', 'classes', 'schedule', 'timetable', 'course', 'courses',
  'lecture', 'lectures', 'subject', 'subjects', 'today', 'tomorrow'
];

const EVENT_KEYWORDS = [
  'event', 'events', 'happening', 'activity', 'activities',
  'festival', 'competition', 'seminar', 'workshop', 'meeting'
];

const DEPARTMENT_KEYWORDS = [
  'department', 'dept', 'office', 'faculty', 'contact',
  'location', 'where is', 'head of'
];

export function analyzeQuery(query: string): ProcessedQuery {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(/\s+/);

  let type: QueryType = 'unknown';
  const keywords: string[] = [];
  let day: string | undefined;
  let department: string | undefined;
  let category: string | undefined;

  const hasClassKeyword = CLASS_KEYWORDS.some(kw => lowerQuery.includes(kw));
  const hasEventKeyword = EVENT_KEYWORDS.some(kw => lowerQuery.includes(kw));
  const hasDepartmentKeyword = DEPARTMENT_KEYWORDS.some(kw => lowerQuery.includes(kw));

  DAYS.forEach(d => {
    if (lowerQuery.includes(d)) {
      day = d;
    }
  });

  if (hasClassKeyword) {
    type = 'class';
    keywords.push(...words.filter(w => !CLASS_KEYWORDS.includes(w) && !DAYS.includes(w)));
  } else if (hasEventKeyword) {
    type = 'event';
    keywords.push(...words.filter(w => !EVENT_KEYWORDS.includes(w)));
  } else if (hasDepartmentKeyword) {
    type = 'department';
    keywords.push(...words.filter(w => !DEPARTMENT_KEYWORDS.includes(w)));
  } else {
    type = 'faq';
    keywords.push(...words);
  }

  return { type, keywords, day, department, category };
}

export async function executeQuery(processedQuery: ProcessedQuery): Promise<string> {
  const { type, keywords, day } = processedQuery;

  try {
    switch (type) {
      case 'class': {
        let query = supabase.from('classes').select('*');

        if (day) {
          const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
          query = query.ilike('day_of_week', capitalizedDay);
        }

        if (keywords.length > 0) {
          const keyword = keywords[0];
          query = query.or(`subject_name.ilike.%${keyword}%,subject_code.ilike.%${keyword}%,instructor.ilike.%${keyword}%,department.ilike.%${keyword}%`);
        }

        const { data, error } = await query.order('start_time');

        if (error) throw error;

        if (!data || data.length === 0) {
          return day
            ? `I couldn't find any classes scheduled for ${day}.`
            : "I couldn't find any classes matching your query.";
        }

        const response = formatClassResponse(data);
        return response;
      }

      case 'event': {
        let query = supabase.from('events').select('*');

        if (keywords.length > 0) {
          const keyword = keywords[0];
          query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,category.ilike.%${keyword}%`);
        }

        const { data, error } = await query
          .gte('event_date', new Date().toISOString().split('T')[0])
          .order('event_date')
          .limit(5);

        if (error) throw error;

        if (!data || data.length === 0) {
          return "I couldn't find any upcoming events matching your query.";
        }

        const response = formatEventResponse(data);
        return response;
      }

      case 'department': {
        let query = supabase.from('departments').select('*');

        if (keywords.length > 0) {
          const keyword = keywords[0];
          query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
          return "I couldn't find any departments matching your query.";
        }

        const response = formatDepartmentResponse(data);
        return response;
      }

      case 'faq': {
        const { data, error } = await supabase
          .from('faqs')
          .select('*');

        if (error) throw error;

        if (!data || data.length === 0) {
          return "I don't have information about that. Please try asking about classes, events, or departments.";
        }

        const bestMatch = findBestFAQMatch(keywords, data);

        if (bestMatch) {
          return bestMatch.answer;
        }

        return "I don't have information about that. You can ask me about class schedules, upcoming events, department information, or general campus questions.";
      }

      default:
        return "I'm not sure what you're asking. You can ask me about class schedules, upcoming events, department information, or general campus questions.";
    }
  } catch (error) {
    console.error('Query execution error:', error);
    return "I encountered an error while processing your request. Please try again.";
  }
}

function formatClassResponse(classes: any[]): string {
  if (classes.length === 1) {
    const cls = classes[0];
    return `${cls.subject_name} (${cls.subject_code}) is scheduled on ${cls.day_of_week} from ${formatTime(cls.start_time)} to ${formatTime(cls.end_time)} in room ${cls.room_number}. The instructor is ${cls.instructor}.`;
  }

  const classInfo = classes.slice(0, 5).map(cls =>
    `${cls.subject_name} at ${formatTime(cls.start_time)} in room ${cls.room_number}`
  ).join(', ');

  return `I found ${classes.length} classes. Here are the details: ${classInfo}.`;
}

function formatEventResponse(events: any[]): string {
  if (events.length === 1) {
    const evt = events[0];
    return `${evt.title} is scheduled on ${formatDate(evt.event_date)} at ${evt.location}. ${evt.description}`;
  }

  const eventInfo = events.map(evt =>
    `${evt.title} on ${formatDate(evt.event_date)} at ${evt.location}`
  ).join(', ');

  return `I found ${events.length} upcoming events: ${eventInfo}.`;
}

function formatDepartmentResponse(departments: any[]): string {
  if (departments.length === 1) {
    const dept = departments[0];
    let response = `The ${dept.name} department is located at ${dept.location}. The department head is ${dept.head}.`;
    if (dept.contact_email) {
      response += ` You can reach them at ${dept.contact_email}.`;
    }
    return response;
  }

  const deptInfo = departments.map(dept =>
    `${dept.name} located at ${dept.location}`
  ).join(', ');

  return `I found ${departments.length} departments: ${deptInfo}.`;
}

function findBestFAQMatch(keywords: string[], faqs: any[]): any | null {
  let bestMatch = null;
  let highestScore = 0;

  for (const faq of faqs) {
    let score = 0;
    const faqText = `${faq.question} ${faq.answer}`.toLowerCase();

    for (const keyword of keywords) {
      if (keyword.length > 2 && faqText.includes(keyword.toLowerCase())) {
        score++;
      }
    }

    if (faq.keywords) {
      for (const faqKeyword of faq.keywords) {
        for (const keyword of keywords) {
          if (keyword.length > 2 && faqKeyword.toLowerCase().includes(keyword.toLowerCase())) {
            score += 2;
          }
        }
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  return highestScore > 0 ? bestMatch : null;
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
