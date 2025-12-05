  "use client"

  import { motion, AnimatePresence, wrap } from "framer-motion"
  import { useEffect, useState, useRef } from "react"
  import {collection,query,orderBy,onSnapshot,doc,updateDoc,arrayUnion,arrayRemove,addDoc,serverTimestamp, Timestamp, deleteDoc, getDoc} from "firebase/firestore"
  import { db, auth } from "@/lib/firebase"
  import useAuth from "@/shared/components/useStudentAuth"
  import {Calendar,MapPin,Heart,MessageCircle,Send,ArrowLeft,ArrowRight, X, Users, User, MoreVertical, Edit, Trash2, Eye, Bookmark} from "lucide-react"
  import { format } from "date-fns"
  import { useStudentLayoutContext } from "@/shared/components/layout/studentLayout/studentLayout"
  import { useNotification } from "@/shared/context/NotificationContext"

  type EventType = {
    id: string
    eventName?: string
    department?: string
    location?: string
    startDate: Date
    endDate: Date
    professor?: string
    description?: string
    imageUrl?: string
    hearts?: string[]
    saves?: string[]
    category?: 'School Event' | 'Seminar' | 'Activity' | 'Social';
    organizerName?: string
    status?: string;
    organizerEmail?: string
    organizerPhotoURL?: string;
    eventType?: string
    maxParticipants?: number
    speakers?: Array<{ name: string; title?: string }>
    registrationLinks?: Array<{ title: string; url: string }>
  }

  type CommentType = {
    id: string
    authorId: string
    authorName: string
    authorPhotoURL?: string
    text: string
    createdAt: Timestamp
  }

  const featuredEventsData = [
    {
      id: 'featured-1',
      title: 'GC APERTURA',
      description: 'Witness the clash of champions. A week of sports, spirit, and unity.',
      imageUrl: 'src/assets/APERTURA.png',
    },
    {
      id: 'featured-2',
      title: 'GC Foundation Week',
      description: 'Celebrate our history and future with a series of special events and activities.',
      imageUrl: 'src/assets/FOUNDING.jpg',
    },
    {
      id: 'featured-3',
      title: 'GC SIKLAB SPORTFEST',
      description: 'Explore the future of technology with industry leaders and innovators.',
      imageUrl: 'src/assets/SPORTSFEST.png',
    },
    {
      id: 'featured-4',
      title: 'GC-CCS ACQUAINTANCE',
      description: 'A vibrant showcase of student talent in music, dance, and visual arts.',
      imageUrl: 'src/assets/ACC.jpg',
    }
  ];

  export default function StudentFeed() {
    const [events, setEvents] = useState<EventType[]>([])
    const [loading, setLoading] = useState(true)
    const { searchQuery } = useStudentLayoutContext();
    const [activeFilter, setActiveFilter] = useState('All');
    const { user } = useAuth()
    const [commentModalEvent, setCommentModalEvent] = useState<EventType | null>(null)
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotification()
    
    useEffect(() => {
      const q = query(collection(db, "events"), orderBy("startDate", "desc"))
      const unsub = onSnapshot(q, (snap) => {
        const fetchOrganizerProfiles = async () => {
          const fetchedEvents = await Promise.all(snap.docs.map(async (d) => {
            const data = d.data();
            let organizerPhotoURL = '';

            if (data.createdBy) {
              try {
                const orgDocRef = doc(db, "organizers", data.createdBy);
                const orgDocSnap = await getDoc(orgDocRef); 
                if (orgDocSnap.exists()) {
                  organizerPhotoURL = orgDocSnap.data().photoURL || '';
                }
              } catch (error) {
                console.error("Error fetching organizer profile:", error);
              }
            }

            return {
              id: d.id,
              ...data,
              startDate: data.startDate?.toDate() ?? new Date(),
              endDate: data.endDate?.toDate() ?? new Date(),
              images: Array.isArray(data.imageUrls) && data.imageUrls.length > 0 ? data.imageUrls : (data.imageUrl ? [data.imageUrl] : []),
              organizerPhotoURL,
            } as EventType & { images?: string[] };
          }));
          setEvents(fetchedEvents);
          setLoading(false);
        };
        fetchOrganizerProfiles();
      })
      return () => unsub()
    }, [])

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const [[page, direction], setPage] = useState([0, 0]);
    const slideIndex = wrap(0, featuredEventsData.length, page);

    const paginate = (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    };

    const goToSlide = (slideIndex: number) => {
      const newDirection = slideIndex > page ? 1 : -1;
      setPage([slideIndex, newDirection]);
    }

    useEffect(() => {
      const interval = setInterval(() => {
        paginate(1);
      }, 5000); 

      return () => clearInterval(interval);
    }, [page]);


    
    const toggleLike = async (eventId: string) => {
      if (!user) return alert("Please sign in to like posts")
        
      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === eventId) {
            const currentHearts = event.hearts || []
            const isLiked = currentHearts.includes(user.uid)
            const newHearts = isLiked
              ? currentHearts.filter(uid => uid !== user.uid)
              : [...currentHearts, user.uid]
            return { ...event, hearts: newHearts }
          }
          return event
        })
      )

      const eventRef = doc(db, "events", eventId)
      const eventToUpdate = events.find(e => e.id === eventId)
      const alreadyLiked = eventToUpdate?.hearts?.includes(user.uid)
      await updateDoc(eventRef, { hearts: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) })
    }

    const toggleSave = async (eventId: string) => {
      if (!user) return addNotification("Please sign in to save events", "warning")

      setEvents(prevEvents =>
        prevEvents.map(event => {
          if (event.id === eventId) {
            const currentSaves = event.saves || [];
            const isSaved = currentSaves.includes(user.uid);
            const newSaves = isSaved
              ? currentSaves.filter(uid => uid !== user.uid)
              : [...currentSaves, user.uid];
            return { ...event, saves: newSaves };
          }
          return event;
        })
      );

      const eventRef = doc(db, "events", eventId);
      const eventToUpdate = events.find(e => e.id === eventId);
      const alreadySaved = eventToUpdate?.saves?.includes(user.uid);
      const isSaving = !alreadySaved;
      
      await updateDoc(eventRef, { saves: alreadySaved ? arrayRemove(user.uid) : arrayUnion(user.uid) });
      
      addNotification(
        isSaving ? "Event saved successfully!" : "Event removed from saved",
        "success",
        2500
      );
    };

    const addComment = async (eventId: string, text: string) => {
      if (!user) return alert("Please sign in to comment")
      if (!text.trim()) return
      try {
        const commentsRef = collection(db, "events", eventId, "comments")
        await addDoc(commentsRef, {
          authorId: user.uid,
          authorName: user.displayName || user.email || "Student",
          authorPhotoURL: user.photoURL || "",
          text: text.trim(),
          createdAt: serverTimestamp(),
        })
      } catch (err) {
        console.error("Error adding comment:", err)
        alert("Failed to post comment.")
      }
    }

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading events...</p>
          </div>
        </div>
      )
    }

    // Helper function to get category from eventType
    const getCategoryFromEventType = (eventType?: string): string => {
      if (!eventType) return 'All';
      
      const activitiesTypes = ['Activities', 'Exhibition', 'Sports', 'Educational', 'Workshop'];
      const socialTypes = ['Social', 'Community'];
      
      if (activitiesTypes.includes(eventType)) return 'Activity';
      if (socialTypes.includes(eventType)) return 'Social';
      if (eventType === 'Seminar') return 'Seminar';
      return 'All';
    };

    const searchFilteredEvents = events.filter((event) => {
        const searchMatch =
            event.eventName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Get category from eventType field
        const eventCategory = getCategoryFromEventType(event.eventType);
        const categoryMatch = activeFilter === 'All' || eventCategory === activeFilter;
        const notCancelled = event.status !== "Canceled";

        return searchMatch && categoryMatch && notCancelled;
    }
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    const sevenDaysFromNow = new Date(today)
    sevenDaysFromNow.setDate(today.getDate() + 7)

    const trendingEvents = searchFilteredEvents
      .filter(event => event.startDate >= today && (event.hearts?.length || 0) > 0) 
      .sort((a, b) => (b.hearts?.length || 0) - (a.hearts?.length || 0)) 
      .slice(0, 3); 


    const todaysEvents = searchFilteredEvents.filter(event => event.startDate >= today && event.startDate <= endOfToday);

    const upcomingEvents = searchFilteredEvents.filter(event => event.startDate > endOfToday && event.startDate <= sevenDaysFromNow);

    const furtherAheadEvents = searchFilteredEvents.filter(event => event.startDate > sevenDaysFromNow);

    const pastEvents = searchFilteredEvents.filter(event => event.startDate < today);

    return (
      <>
          <section className="bg-gradient-to-b from-slate-50 to-white pt-4">
            <div className="relative px-4 md:px-8 ">
              <div className="relative h-96 w-full overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                  <FeaturedEventCard
                    key={page}
                    title={featuredEventsData[slideIndex].title}
                    description={featuredEventsData[slideIndex].description}
                    imageUrl={featuredEventsData[slideIndex].imageUrl}
                    direction={direction}
                  />
                </AnimatePresence>
                <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-20">
                  <button onClick={() => paginate(-1)} className="bg-white/60 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-md transition-all">
                    <ArrowLeft className="h-6 w-6 text-gray-800" />
                  </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-20">
                  <button onClick={() => paginate(1)} className="bg-white/60 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-md transition-all">
                    <ArrowRight className="h-6 w-6 text-gray-800" />
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {featuredEventsData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      slideIndex === index ? 'bg-green-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="px-4 md:px-8 py-6">
              <div className="flex overflow-x-auto sm:grid sm:grid-cols-4 gap-4 md:gap-6 pb-2 -mb-2 ">
                <FilterCard
                  label="All Events"
                  imageUrl="src/assets/campusEvent.jpg"
                  isActive={activeFilter === 'All'}
                  onClick={() => setActiveFilter('All')}
                  className="flex-shrink-0 w-20 sm:w-auto"
                />
                <FilterCard
                  label="Seminars"
                  imageUrl="src/assets/gcSeminar.jpg"
                  isActive={activeFilter === 'Seminar'}
                  onClick={() => setActiveFilter('Seminar')}
                  className="flex-shrink-0 w-28 sm:w-auto"
                />
                <FilterCard
                  label="Activities"
                  imageUrl="src/assets/gcAct.jpg"
                  isActive={activeFilter === 'Activity'}
                  onClick={() => setActiveFilter('Activity')}
                  className="flex-shrink-0 w-28 sm:w-auto"
                />
                <FilterCard
                  label="Social"
                  imageUrl="src/assets/socialGC.jpg"
                  isActive={activeFilter === 'Social'}
                  onClick={() => setActiveFilter('Social')}
                  className="flex-shrink-0 w-28 sm:w-auto"
                />
              </div>
            </div>

            <div className="p-4 md:p-6">
              {searchFilteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-center">
                    <p className="text-muted-foreground text-lg mb-2">
                      {searchQuery
                        ? "No events match your search." : "No events available."}
                    </p>
                    <p className="text-muted-foreground text-sm">Check back soon for exciting campus events!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingEvents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-foreground">Trending Now</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {trendingEvents.map((event) => (
                          <TrendingEventCard
                            key={`trending-${event.id}`}
                            event={event}
                            onCommentClick={(event) => setCommentModalEvent(event)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {upcomingEvents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-foreground">Upcoming Events</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onLike={toggleLike}
                            onSave={toggleSave}
                            currentUser={user}
                            onCommentClick={(event) => setCommentModalEvent(event)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {todaysEvents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-foreground">Today's Events</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {todaysEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onLike={toggleLike}
                            onSave={toggleSave}
                            currentUser={user}
                            onCommentClick={(event) => setCommentModalEvent(event)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {furtherAheadEvents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-foreground">Further Ahead</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {furtherAheadEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onLike={toggleLike}
                            onSave={toggleSave}
                            currentUser={user}
                            onCommentClick={(event) => setCommentModalEvent(event)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Past Events */}
                  {pastEvents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
                          <h3 className="text-2xl font-bold text-foreground">Past Events</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pastEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onLike={toggleLike}
                            onSave={toggleSave}
                            currentUser={user}
                            onCommentClick={(event) => setCommentModalEvent(event)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        <AnimatePresence>
          {commentModalEvent && (
            <ExpandedEventCard
              event={commentModalEvent}
              onClose={() => setCommentModalEvent(null)}
              onLike={toggleLike}
              onComment={addComment}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLogoutConfirmOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
              >
                <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
                <p className="text-sm text-gray-600 mt-2">Are you sure you want to log out of your account?</p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setIsLogoutConfirmOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button onClick={() => { /* This will now use the layout's handleLogout */ }} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                    Logout
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </>
    )
  }

  const sliderVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const FeaturedEventCard = ({ title, description, imageUrl, direction }: { title: string, description: string, imageUrl: string, direction: number }) => {
    return (
      <motion.div 
        key={title}
        custom={direction}
        variants={sliderVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
        className="absolute h-96 w-full rounded-2xl overflow-hidden group cursor-pointer shadow-xl"
      >
        <img src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full md:w-3/4 lg:w-2/3">
          <h3 className="text-3xl md:text-4xl font-bold drop-shadow-lg">{title}</h3>
          <p className="text-sm md:text-base text-white/90 mt-2 line-clamp-2 drop-shadow-md">{description}</p>
          <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold bg-white text-black px-5 py-2.5 rounded-lg shadow-lg hover:bg-gray-200 transition-colors transform hover:-translate-y-0.5">
            Learn More <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  };



  function EventCard({ 
    event,
    onLike,
    onSave,
    onCommentClick,
  }: {
    event: EventType & { organizerName?: string; organizerEmail?: string; images?: string[] };
    onLike: (id: string) => void;
    onSave: (id: string) => void;
    onCommentClick: (event: EventType) => void;
    currentUser: any
  }) {
    const [comments, setComments] = useState<CommentType[]>([])

    useEffect(() => {
      const q = query(collection(db, "events", event.id, "comments"), orderBy("createdAt", "asc"))
      const unsub = onSnapshot(q, (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setComments(arr)
      })
      return () => unsub()
    }, [event.id])

    const hearts = event.hearts ?? []
    const { user } = useAuth()
    const liked = user && user.uid && hearts.includes(user.uid)
    const saves = event.saves ?? [];
    const saved = user && user.uid && saves.includes(user.uid);

    const images = event.images && event.images.length > 0 ? event.images : event.imageUrl ? [event.imageUrl] : [];

    return (
      <motion.div layoutId={`card-container-${event.id}`} whileHover={{ y: -8 }} transition={{ duration: 0.2 }}>
        <div 
          onClick={() => onCommentClick(event)}
          className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
        >

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white">
                {event.organizerPhotoURL ? (
                  <img src={event.organizerPhotoURL} alt={event.organizerName || 'Organizer'} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">{event.organizerName ? event.organizerName[0].toUpperCase() : "O"}</span>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 text-sm leading-tight">{event.organizerName || "Organizer"}</h4>
                <p className="text-xs text-gray-500">{event.organizerEmail || "organizer@email.com"}</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>

          <div className="px-4 pb-3">
            <div className="relative w-full h-56 rounded-lg overflow-hidden grid grid-cols-3 gap-1">
              {images[0] && (
                <div className="col-span-1 row-span-2 relative overflow-hidden rounded-lg">
                  <img src={images[0]} alt="Event main" className="w-full h-full object-cover" />
                </div>
              )}
              {images[1] && (
                <div className="col-span-1 relative overflow-hidden rounded-lg">
                  <img src={images[1]} alt="Event 2" className="w-full h-full object-cover" />
                </div>
              )}
              {images[2] && (
                <div className="col-span-1 relative overflow-hidden rounded-lg">
                  <img src={images[2]} alt="Event 3" className="w-full h-full object-cover" />
                </div>
              )}
              {images[3] && (
                <div className="col-span-1 relative overflow-hidden rounded-lg">
                  <img src={images[3]} alt="Event 4" className="w-full h-full object-cover" />
                </div>
              )}
              {images.length === 0 && <div className="col-span-3 bg-gray-200 rounded-lg"></div>}
            </div>
          </div>

          {/* Title & Description */}
          <div className="px-4 pb-3">
            <h3 className="text-base font-bold text-gray-900 line-clamp-1">{event.eventName || "Untitled Event"}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{event.description}</p>
          </div>

          {/* Event Timing / Registration Links */}
          {event.registrationLinks && event.registrationLinks.length > 0 ? (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {event.registrationLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition font-medium"
                >
                  {link.title}
                </a>
              ))}
            </div>
          ) : (
            <div className="px-4 pb-3 text-xs text-gray-500">
              Event ends {event.endDate && !isNaN(event.endDate.getTime()) ? format(event.endDate, "MMM do 'at' h:mm a") : "Soon"}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="px-4 py-2 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-medium">{hearts.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{comments.length}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-around">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(event.id); }}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
                liked 
                  ? 'bg-red-50 text-red-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">Like</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCommentClick(event); }}
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all duration-200 flex-1"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Comment</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSave(event.id); }}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${
                saved
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  function TrendingEventCard({ event, onCommentClick }: { event: EventType, onCommentClick: (event: EventType) => void }) {
    const { user } = useAuth();
    const hearts = event.hearts ?? [];
    const liked = user && user.uid && hearts.includes(user.uid);

    return (
        <motion.div 
            whileHover={{ y: -5 }} 
            transition={{ duration: 0.2 }}
            onClick={() => onCommentClick(event)} // eslint-disable-line
            className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:h-48"
        >
            {/* Image */}
            <div className="w-full h-48 md:w-2/5 md:h-full relative flex-shrink-0">
                <img
                  src={((event as any).images && (event as any).images[0]) || event.imageUrl || 'src/assets/placeholder.jpg'}
                  alt={event.eventName || "Event"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
            </div>

            {/* Content */}
            <div className="flex flex-col p-5 flex-grow">
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{event.eventName}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{event.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(event.startDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{event.location}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-semibold ${liked ? 'text-red-500' : ''}`}>
                        <Heart className="h-3.5 w-3.5" />
                        <span>{hearts.length} Likes</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

  const FilterCard = ({ label, imageUrl, isActive, onClick, className }: { label: string, imageUrl: string, isActive: boolean, onClick: () => void, className?: string }) => {
    return (
      <motion.div
        onClick={onClick}
        className={`relative h-14 sm:h-24 rounded-lg bg-cover bg-center shadow-lg overflow-hidden group cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${isActive ? 'ring-1 ring-offset-2 ring-[#7cb93c]' : 'ring-0'} ${className}`}
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <h4 className="text-white font-bold text-xs sm:text-sm md:text-base text-center drop-shadow-md">
            {label}
          </h4>
        </div>
      </motion.div>
    );
  };

  function CommentItem({
    comment: c,
    event,
    currentUser,
    onUpdate,
    onDelete,
  }: {
    comment: CommentType;
    event: EventType;
    currentUser: any;
    onUpdate: (eventId: string, commentId: string, newText: string) => void;
    onDelete: (eventId: string, commentId: string) => void;
  }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(c.text);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
  
    const isAuthor = currentUser && currentUser.uid === c.authorId;
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    const handleUpdate = () => {
      if (editText.trim() && editText.trim() !== c.text) {
        onUpdate(event.id, c.id, editText.trim());
      }
      setIsEditing(false);
    };
  
    const handleDelete = () => {
      if (window.confirm("Are you sure you want to delete this comment?")) {
        onDelete(event.id, c.id);
      }
      setIsMenuOpen(false);
    };
  
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-sm group/comment hover:bg-gray-100 transition relative">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-2 flex-1">
            {/* Profile Photo */}
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-gray-200">
              {c.authorPhotoURL ? (
                <img src={c.authorPhotoURL} alt={c.authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-white">{c.authorName[0]?.toUpperCase() || "U"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{c.authorName}</p>
              {isEditing ? (
                <div className="mt-1">
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      onBlur={handleUpdate}
                      className="w-full text-gray-700 bg-white border border-green-100 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-300 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button type="submit" className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md">Save</button>
                      <button type="button" onClick={() => { setIsEditing(false); setEditText(c.text); }} className="text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md">Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{c.text}</p>
              )}
            </div>
          </div>
          {isAuthor && !isEditing && (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(v => !v)} className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white rounded-md shadow-lg z-10 border border-gray-100">
                  <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <span> Edit</span>
                  </button>
                  <button onClick={handleDelete} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <span> Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {!isEditing && (
          <p className="text-xs text-gray-500 mt-2">
            {c.createdAt?.toDate ? format(c.createdAt.toDate(), "MMM dd, p") : "Just now"}
          </p>
        )}
      </div>
    );
  }

  function ExpandedEventCard({ event, onClose, onLike, onComment }: { event: EventType, onClose: () => void, onLike: (id: string) => void, onComment: (id: string, text: string) => void }) { // eslint-disable-line
    const [comment, setComment] = useState("")
    const [comments, setComments] = useState<CommentType[]>([])
    const [[imagePage, imageDirection], setImagePage] = useState([0, 0]);
    const [isZoomed, setIsZoomed] = useState(false);
    const { user } = useAuth() 
    useEffect(() => {
      const q = query(collection(db, "events", event.id, "comments"), orderBy("createdAt", "asc"))
      const unsub = onSnapshot(q, (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        setComments(arr)
      })
      return () => unsub()
    }, [event.id])

    const hearts = event.hearts ?? []
    const liked = user && user.uid && hearts.includes(user.uid)

    const modalContentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
          onClose()
        }
      }
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [onClose])

    const images = (event as any).images && (event as any).images.length > 0
      ? (event as any).images
      : event.imageUrl ? [event.imageUrl] : [];

    const imageIndex = wrap(0, images.length, imagePage);
    const paginateImages = (newDirection: number) => {
      setImagePage([imagePage + newDirection, newDirection]);
    };

    const updateComment = async (eventId: string, commentId: string, newText: string) => {
      try {
        const commentRef = doc(db, "events", eventId, "comments", commentId);
        await updateDoc(commentRef, { text: newText });
      } catch (error) {
        console.error("Error updating comment: ", error);
        alert("Failed to update comment.");
      }
    };
  
    const deleteComment = async (eventId: string, commentId: string) => {
      try {
        const commentRef = doc(db, "events", eventId, "comments", commentId);
        await deleteDoc(commentRef);
      } catch (error) {
        console.error("Error deleting comment: ", error);
        alert("Failed to delete comment.");
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-50 bg-black/40 hover:bg-black/60 rounded-full p-2"
        >
          <X className="h-6 w-6" />
        </button>
        <motion.div
          ref={modalContentRef}
          layoutId={`card-container-${event.id}`}
          className="w-full max-w-9xl max-h-[100vh] flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Image Carousel Section - Left Side */}
          {images.length > 0 && (
            <div className="relative w-full h-80 md:h-auto md:w-3/5 bg-black flex items-center justify-center flex-shrink-0">
              <AnimatePresence initial={false} custom={imageDirection}>
                <motion.img
                  key={imagePage}
                  src={images[imageIndex]}
                  alt={`Event image ${imageIndex + 1}`}
                  className={`absolute w-full h-full transition-all duration-300 ${
                    isZoomed ? 'object-contain' : 'object-cover'
                  }`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </AnimatePresence>

              {/* Zoom button */}
              <button
                onClick={() => setIsZoomed(prev => !prev)}
                className="absolute bottom-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all z-10"
                title={isZoomed ? "Zoom out" : "Zoom in"}
              >
                <Eye className="h-5 w-5 text-white" />
              </button>

              {/* Previous Button */}
              {images.length > 1 && (
                <button
                  onClick={() => paginateImages(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all z-10"
                >
                  <ArrowLeft className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Next Button */}
              {images.length > 1 && (
                <button
                  onClick={() => paginateImages(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 shadow-lg transition-all z-10"
                >
                  <ArrowRight className="h-6 w-6 text-white" />
                </button>
              )}

              {/* Image Counter & Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20">
                  {/* Counter */}
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {imageIndex + 1} / {images.length}
                  </div>
                  
                  {/* Dots */}
                  <div className="flex gap-2">
                    {images.map((_: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setImagePage([idx, idx > imageIndex ? 1 : -1])}
                        className={`rounded-full transition-all ${
                          idx === imageIndex 
                            ? 'bg-green-600 w-3 h-2' 
                            : 'bg-white/90 hover:bg-white/90 w-2 h-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content Section - Right Side */}
          <div className="w-full md:w-2/5 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-4 pb-3 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white">
                    {event.organizerPhotoURL ? (
                      <img src={event.organizerPhotoURL} alt={event.organizerName || 'Organizer'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-base font-bold text-white">{event.organizerName ? event.organizerName[0].toUpperCase() : "O"}</span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{event.organizerName || "Organizer"}</p>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{event.eventName || "Untitled Event"}</h2>
              </div>

              {/* Description & Details */}
              <div className="p-6 space-y-5">
                {event.description && (
                  <div>
                    <p className="text-sm leading-relaxed text-gray-700 font-medium">Description</p>
                    <p className="text-base leading-relaxed text-gray-900 mt-2">
                      {event.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {event.startDate && !isNaN(event.startDate.getTime()) && (
                    <div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Date & Time</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{format(event.startDate, "PPP" )} <br /> {format(event.startDate, "p")} </p>
                      </div>
                    </div>
                  )}
                  
                  {event.location && (
                    <div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Location</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {event.professor && (
                    <div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Professor/Coordinator</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.professor}</p>
                      </div>
                    </div>
                  )}

                  {event.department && (
                    <div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Department</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.department}</p>
                      </div>
                    </div>
                  )}

                  {event.eventType && (
                    <div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Event Type</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.eventType}</p>
                      </div>
                    </div>
                  )}

                  {event.speakers && event.speakers.length > 0 && (
                     <div>
                       <div>
                         <p className="text-xs text-gray-500 font-medium">Speaker</p>
                         <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.speakers[0].name}</p>
                       </div>
                     </div>
                  )}

                  {event.maxParticipants && (
                    <div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Max Participants</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{event.maxParticipants}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Comments Section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Comments ({comments.length})
                  </h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {comments.length > 0 ? (
                      comments.map((c) => (
                        <CommentItem
                          key={c.id}
                          comment={c}
                          event={event}
                          currentUser={user}
                          onUpdate={updateComment}
                          onDelete={deleteComment}
                        />
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0 space-y-2">
              <div className="flex items-center gap-2 pb-2">
                <button
                  onClick={() => onLike(event.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    liked 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <motion.div whileTap={{ scale: 1.2 }}>
                    <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  </motion.div>
                  <span className="font-semibold text-xs">{hearts.length}</span>
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (comment.trim()) {
                    onComment(event.id, comment)
                    setComment("")
                  }
                }}
                className="flex gap-1"
              >
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs bg-gray-50 text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }
