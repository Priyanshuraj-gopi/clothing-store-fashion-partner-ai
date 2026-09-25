import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Heart,
  MapPin,
  Mic,
  Navigation,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  WandSparkles,
  X,
  Users,
  Bell,
  DoorOpen,
} from 'lucide-react';
import { ChangeEvent, DragEvent, useEffect, useMemo, useState, useRef } from 'react';
import { inventory } from './data/inventory';
import { useSpeechManager } from './hooks/useSpeechManager';
import {
  analyzeUserImage,
  chatWithStylist,
  generateAccessories,
  generateStylingAdvice,
  itemTotal,
  productById,
  recommendOutfits,
} from './lib/stylistEngine';
import { getLiveStylistReply } from './lib/stylistClient';
import { CartLine, CustomerRecord, FitProfile, Outfit, Product, Screen } from './types';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { CrmPortal } from './components/CrmPortal';
import './index.css';

const initialFit: FitProfile = {
  height: 'Approx. 5′7″',
  size: 'M',
  shoulders: 'Balanced',
  proportions: 'Balanced frame',
  preference: 'Relaxed-tailored',
};

const occasions = ['Date Night', 'College', 'Office', 'Wedding', 'Party', 'Casual', 'Vacation', 'Custom'];
const styles = ['Minimal', 'Streetwear', 'Classic', 'Quiet Luxury', 'Trendy', 'Bold', 'Surprise Me'];
const screenSteps: Screen[] = ['landing', 'analysis', 'chat', 'looks', 'saved', 'cart', 'checkout', 'thanks', 'crm'];
const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const productIcon: Record<string, string> = {
  top: '✦',
  bottom: '◒',
  shoes: '◈',
  accessory: '✧',
  'one-piece': '◉',
};

type ChatMessage = { role: 'ai' | 'user'; text: string };

function routeFor(screen: Screen) {
  const index = screenSteps.indexOf(screen);
  return Math.max(0, Math.min(5, index - 1));
}

function ProductPill({
  product,
  onRoute,
  selectable,
  selected,
  onToggle,
}: {
  product: Product;
  onRoute: (product: Product) => void;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className={`product-pill ${selected ? 'selected' : ''}`}>
      <button
        className="product-mark"
        aria-label={`Show ${product.name} location on store map`}
        onClick={() => onRoute(product)}
      >
        <span>{productIcon[product.category]}</span>
      </button>
      <div className="product-copy">
        <p>{product.category === 'one-piece' ? 'Statement piece' : product.category}</p>
        <strong>{product.name}</strong>
        <span>
          {product.brand} · {formatPrice(product.price)}
        </span>
      </div>
      <div className="product-end">
        {selectable && (
          <button
            className="check-button"
            aria-label={`Select ${product.name} for styling`}
            onClick={onToggle}
          >
            {selected ? <Check size={16} /> : <Plus size={16} />}
          </button>
        )}
        <button
          className="location-button"
          onClick={() => onRoute(product)}
          aria-label={`Navigate to Aisle ${product.aisle}, Shelf ${product.shelf}`}
        >
          <MapPin size={14} /> {product.aisle} · {product.shelf}
        </button>
      </div>
    </div>
  );
}

function StoreRoute({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <motion.div
      className="route-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="route-sheet"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label="In-Store Route Map"
      >
        <button className="icon-button route-close" aria-label="Close navigation" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="eyebrow">
          <Navigation size={14} /> In-store route guide
        </div>
        <h3>Follow the gold markers.</h3>
        <p className="route-item">{product.name} · {product.category.toUpperCase()}</p>
        <div className="store-map" aria-label={`Store route to aisle ${product.aisle}, shelf ${product.shelf}`}>
          <span className="map-label entry">YOU ARE HERE</span>
          <i className="map-path" />
          <span className="map-dot start" />
          <span className="map-dot end" />
          <span className="map-label destination">{product.aisle}</span>
          <span className="map-rack rack-a">A1</span>
          <span className="map-rack rack-b">A2</span>
          <span className="map-rack rack-c">{product.aisle}</span>
          <span className="map-rack rack-d">D1</span>
          <span className="map-rack rack-e">E1</span>
        </div>
        <div className="route-details">
          <div>
            <span>WALK</span>
            <strong>2 min</strong>
          </div>
          <div>
            <span>DEPARTMENT</span>
            <strong>{product.category === 'shoes' ? 'Footwear Salon' : product.category === 'accessory' ? 'Accessories' : 'Main Floor'}</strong>
          </div>
          <div>
            <span>AISLE & SHELF</span>
            <strong>{product.aisle} · Shelf {product.shelf}</strong>
          </div>
        </div>
        <button className="button primary full" onClick={onClose}>
          I’ll find it <ArrowRight size={16} />
        </button>
      </motion.section>
    </motion.div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [photo, setPhoto] = useState<string | null>(null);
  const photoUrlRef = useRef<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [fitReady, setFitReady] = useState(false);
  const [fit, setFit] = useState<FitProfile>(initialFit);
  const [occasion, setOccasion] = useState('');
  const [style, setStyle] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [, setStylistThinking] = useState(false);
  const [liveStylist, setLiveStylist] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'What are you shopping for today? I’ll match the mood to what is actually on this store’s floor.' },
  ]);
  const [looks, setLooks] = useState<Outfit[]>([]);
  const [activeLook, setActiveLook] = useState(0);
  const [liked, setLiked] = useState<Outfit[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('caelus-liked') ?? '[]') as Outfit[];
    } catch {
      return [];
    }
  });
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(sessionStorage.getItem('caelus-cart') ?? '[]') as CartLine[];
    } catch {
      return [];
    }
  });
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [routeProduct, setRouteProduct] = useState<Product | null>(null);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [crmOpen, setCrmOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [orderValue, setOrderValue] = useState(0);
  const [toast, setToast] = useState('');
  const { muted, setMuted, listening, stop, speak, listen, voiceSupported } = useSpeechManager();

  // Storage persistence
  useEffect(() => {
    try {
      sessionStorage.setItem('caelus-liked', JSON.stringify(liked));
    } catch {
      // Ignored
    }
  }, [liked]);

  useEffect(() => {
    try {
      sessionStorage.setItem('caelus-cart', JSON.stringify(cart));
    } catch {
      // Ignored
    }
  }, [cart]);

  // Cleanup speech synthesis on screen changes
  useEffect(() => {
    stop();
  }, [screen, stop]);

  // Toast auto-clear timer
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Cleanup ObjectURL memory leak on unmount
  useEffect(() => {
    return () => {
      if (photoUrlRef.current) {
        URL.revokeObjectURL(photoUrlRef.current);
      }
    };
  }, []);

  const request = { occasion: occasion || 'Date Night', style: style || 'Minimal', fit, feedback };
  const cartProducts = useMemo(() => {
    return cart.flatMap((line) => {
      const product = productById(line.productId);
      return product ? [{ product, quantity: line.quantity }] : [];
    });
  }, [cart]);

  const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = cartProducts.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const discount = subtotal > 12000 ? 600 : 0;
  const total = subtotal + tax - discount;

  const go = (next: Screen) => {
    stop();
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const flash = (message: string) => setToast(message);

  // Safe image upload with ObjectURL leak prevention and size limits
  const uploadPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flash('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      flash('Image size exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    photoUrlRef.current = objectUrl;
    setPhoto(objectUrl);
    setFitReady(false);
    flash('Photo loaded. Tap "Analyse my fit" to continue.');
  };

  const handleCameraCapture = (imageDataUrl: string) => {
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
    }
    setPhoto(imageDataUrl);
    setFitReady(false);
    flash('Live camera silhouette captured.');
  };

  const onPhotoInput = (event: ChangeEvent<HTMLInputElement>) => {
    uploadPhoto(event.target.files?.[0]);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    uploadPhoto(event.dataTransfer.files?.[0]);
  };

  const startAnalysis = async () => {
    if (!photo && !demoMode) {
      flash('Add a photo or use Judge Demo Mode to continue.');
      return;
    }
    setScanning(true);
    const result = await analyzeUserImage();
    setFit(result);
    setScanning(false);
    setFitReady(true);
    flash('AI fit estimate ready. Review your measurements below.');
  };

  const runDemo = () => {
    setDemoMode(true);
    setPhoto(null);
    setFit(initialFit);
    setFitReady(true);
    setOccasion('Date Night');
    setStyle('Quiet Luxury');
    setMessages([
      {
        role: 'ai',
        text: 'Demo profile ready. I’ve preloaded a smart-casual date-night brief so you can see the complete in-store AI styling experience.',
      },
    ]);
    go('analysis');
  };

  const selectOccasion = (value: string) => {
    stop();
    setOccasion(value);
    setMessages((items) => [
      ...items,
      { role: 'user', text: value },
      { role: 'ai', text: 'Lovely choice. What kind of style aesthetic are you feeling?' },
    ]);
  };

  const selectStyle = (value: string) => {
    stop();
    setStyle(value);
    const reply = chatWithStylist(occasion || 'your plans', value);
    setMessages((items) => [...items, { role: 'user', text: value }, { role: 'ai', text: reply }]);
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if (!text) return;
    stop();
    setChatInput('');
    const nextOccasion = occasion || 'Custom';
    const nextStyle = style || 'Minimal';
    if (!occasion) setOccasion(nextOccasion);
    if (!style) setStyle(nextStyle);
    const conversation = [...messages, { role: 'user' as const, text }];
    setMessages(conversation);
    setStylistThinking(true);

    try {
      const reply = await getLiveStylistReply({
        message: text,
        occasion: nextOccasion,
        style: nextStyle,
        fit,
        conversation,
      });
      setLiveStylist(true);
      setMessages((items) => [...items, { role: 'ai', text: reply }]);
    } catch {
      setLiveStylist(false);
      setMessages((items) => [
        ...items,
        {
          role: 'ai',
          text: `I hear you. I’ll treat “${text}” as your personal styling note and weave it into these ${nextStyle.toLowerCase()} options.`,
        },
      ]);
    } finally {
      setStylistThinking(false);
    }
  };

  const buildLooks = () => {
    stop();
    const generated = recommendOutfits(request);
    setLooks(generated);
    setActiveLook(0);
    go('looks');
  };

  const addItems = (productIds: string[]) => {
    setCart((lines) => {
      const updated = [...lines];
      productIds.forEach((productId) => {
        const index = updated.findIndex((line) => line.productId === productId);
        if (index >= 0) {
          updated[index] = { ...updated[index], quantity: updated[index].quantity + 1 };
        } else {
          updated.push({ productId, quantity: 1 });
        }
      });
      return updated;
    });
  };

  const addLook = (outfit: Outfit, navigate = false) => {
    addItems(outfit.itemIds);
    flash(`${outfit.title} has been added to your store bag.`);
    if (navigate) go('cart');
  };

  const toggleLike = (outfit: Outfit) => {
    const isLiked = liked.some((item) => item.id === outfit.id);
    setLiked((items) => (isLiked ? items.filter((item) => item.id !== outfit.id) : [...items, outfit]));
    flash(isLiked ? 'Removed from your Caelus Edit.' : 'Saved to your Caelus Edit.');
    if (!isLiked && activeLook < looks.length - 1) {
      window.setTimeout(() => setActiveLook((value) => value + 1), 300);
    }
  };

  const passLook = (reason?: string) => {
    if (reason && !feedback.includes(reason)) {
      setFeedback((items) => [...items, reason]);
    }
    setFeedbackOpen(false);
    flash(reason ? 'Noted — the next recommendation will adapt.' : 'Skipped look.');
    if (activeLook < looks.length - 1) {
      setActiveLook((value) => value + 1);
    }
  };

  const updateCart = (productId: string, amount: number) => {
    setCart((lines) =>
      lines.flatMap((line) => {
        if (line.productId !== productId) return [line];
        const quantity = line.quantity + amount;
        return quantity > 0 ? [{ ...line, quantity }] : [];
      })
    );
  };

  const completePayment = () => {
    if (!cart.length) {
      flash('Your bag is waiting for a look.');
      return;
    }
    setPaying(true);
    window.setTimeout(() => {
      setOrderValue(total);
      setPaying(false);
      setCart([]);
      go('thanks');
    }, 1400);
  };

  const resetJourney = () => {
    setOccasion('');
    setStyle('');
    setLooks([]);
    setFeedback([]);
    if (photoUrlRef.current) {
      URL.revokeObjectURL(photoUrlRef.current);
      photoUrlRef.current = null;
    }
    setPhoto(null);
    setFitReady(false);
    setDemoMode(false);
    go('landing');
  };

  const handleSelectCustomerFromCrm = (customer: CustomerRecord) => {
    setFit(customer.fitProfile);
    setOccasion(customer.favoriteOccasion);
    setStyle(customer.favoriteStyle);
    setFitReady(true);
    setMessages([
      {
        role: 'ai',
        text: `Welcome back, ${customer.fullName}. I’ve loaded your ${customer.tier} profile (${customer.fitProfile.size} · ${customer.fitProfile.preference}). Stylist note: “${customer.stylistNotes}”. Let’s prepare today’s collection.`,
      },
    ]);
    flash(`Active client switched to ${customer.fullName}.`);
    go('chat');
  };

  const requestFittingSuite = () => {
    flash('Fitting Suite #2 notified. A store stylist is bringing your selected pieces.');
  };

  const currentOutfit = looks[activeLook];
  const currentProducts =
    currentOutfit?.itemIds.map(productById).filter((product): product is Product => Boolean(product)) ?? [];
  const accessoryIdeas = generateAccessories(
    cart.map((line) => line.productId),
    request
  );

  return (
    <main>
      <div className="app-shell">
        {screen !== 'landing' && (
          <header className="topbar">
            <button
              className="brand brand-small"
              onClick={() => go('landing')}
              aria-label="Return to Fashion Partner AI home"
            >
              <span className="brand-orbit">◉</span>
              <span>
                vortex <i>caelus</i>
              </span>
            </button>
            <div className="topbar-actions">
              <button
                className="crm-pill-btn"
                onClick={() => setCrmOpen(true)}
                aria-label="Open Retail Associate CRM"
              >
                <Users size={15} /> Stylist CRM
              </button>
              <button
                className="icon-button"
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? 'Turn audio narration on' : 'Mute audio narration'}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button className="bag-button" onClick={() => go('cart')} aria-label={`View bag (${cartCount} items)`}>
                <ShoppingBag size={17} />
                <span>{cartCount}</span>
              </button>
            </div>
          </header>
        )}

        {screen !== 'landing' && screen !== 'thanks' && (
          <div className="journey-progress" aria-label={`Journey step ${routeFor(screen) + 1} of 6`}>
            {['FIT', 'STYLE', 'LOOKS', 'EDIT', 'BAG', 'PAY'].map((label, index) => (
              <span key={label} className={index <= routeFor(screen) ? 'complete' : ''}>
                <i />
                {label}
              </span>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <motion.section
              key="landing"
              className="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="landing-glow glow-one" />
              <div className="landing-glow glow-two" />
              <div className="orbit-line orbit-one" />
              <div className="orbit-line orbit-two" />
              <nav className="landing-nav">
                <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <span className="brand-orbit">◉</span>
                  <span>
                    vortex <i>caelus</i>
                  </span>
                </button>
                <div className="landing-nav-actions">
                  <button className="crm-pill-btn" onClick={() => setCrmOpen(true)}>
                    <Users size={15} /> Stylist CRM Portal
                  </button>
                  <button className="demo-button" onClick={runDemo}>
                    <WandSparkles size={15} /> Judge Demo Mode
                  </button>
                </div>
              </nav>

              <div className="landing-copy">
                <img
                  src="/vortex-logo.jpg"
                  className="logo-image"
                  width="152"
                  height="75"
                  alt="Vortex Caelus — In-Store Fashion Partner AI"
                />
                <p className="landing-eyebrow">
                  <Sparkles size={14} /> Your in-store AI stylist
                </p>
                <h1>
                  Find the look.
                  <br />
                  <em>Not just an outfit.</em>
                </h1>
                <p className="landing-subtitle">
                  Caelus calibrates your occasion, fit proportions and mood into complete looks waiting on this store’s
                  floor with exact shelf navigation.
                </p>
                <div className="landing-actions">
                  <button className="button primary" onClick={() => go('analysis')}>
                    Find my look <ArrowRight size={17} />
                  </button>
                  <button className="button ghost" onClick={runDemo}>
                    Explore store
                  </button>
                </div>
                <div className="proof-row">
                  <span>
                    <b>⌁</b> Fit-aware visual styling
                  </span>
                  <span>
                    <b>⌁</b> Exact aisle locator
                  </span>
                  <span>
                    <b>⌁</b> Associate CRM integration
                  </span>
                </div>
              </div>

              <aside className="landing-insight">
                <span className="metric-label">DEMO SIGNAL</span>
                <strong>+12%</strong>
                <p>
                  style-match confidence
                  <br />
                  <small>simulated prototype metric</small>
                </p>
              </aside>
              <div className="floating-card card-one">
                <span>01</span>
                <b>Curated for you</b>
                <small>4 in-stock pieces</small>
              </div>
              <div className="floating-card card-two">
                <MapPin size={17} />
                <b>A3 · 2B</b>
                <small>2 min walk</small>
              </div>
            </motion.section>
          )}

          {screen === 'analysis' && (
            <motion.section
              key="analysis"
              className="page analysis-page page-enter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="section-heading">
                <p className="eyebrow">
                  <Sparkles size={14} /> Step 01 · private by design
                </p>
                <h1>
                  Let’s understand <em>your fit.</em>
                </h1>
                <p>
                  Upload a photo or use the in-store camera for a visual fit estimate. All analysis runs privately and
                  is fully editable.
                </p>
              </div>

              <div className="analysis-grid">
                <div className="upload-zone-wrap">
                  <label
                    className={`upload-zone ${photo || demoMode ? 'has-photo' : ''}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={onDrop}
                  >
                    {photo ? (
                      <img src={photo} alt="Your uploaded fit reference" />
                    ) : (
                      <div className="demo-portrait">
                        <span>VC</span>
                        <i />
                      </div>
                    )}
                    {(scanning || fitReady) && (
                      <div className="scan-overlay">
                        <i />
                        <span>{scanning ? 'ANALYSING' : 'FIT PROFILE READY'}</span>
                      </div>
                    )}
                    {!photo && !demoMode && (
                      <div className="upload-prompt">
                        <Camera size={26} />
                        <strong>Drop a photo here</strong>
                        <span>or tap to browse your gallery</span>
                        <small>JPG, PNG, WebP · max 10MB</small>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={onPhotoInput}
                      aria-label="Upload photo for fit analysis"
                    />
                  </label>

                  <div className="camera-action-row">
                    <button
                      type="button"
                      className="button ghost small"
                      onClick={() => setCameraModalOpen(true)}
                    >
                      <Camera size={14} /> Open In-Store Camera
                    </button>
                    {photo && (
                      <button
                        type="button"
                        className="button ghost small"
                        onClick={() => {
                          setPhoto(null);
                          setFitReady(false);
                        }}
                      >
                        Reset Photo
                      </button>
                    )}
                  </div>

                  <p className="privacy-line">
                    ◌ Your photo stays private in this demo. It never leaves your browser session.
                  </p>
                </div>

                <div className="analysis-side">
                  {!fitReady ? (
                    <>
                      <div className="scan-status">
                        <span className={scanning ? 'pulse-dot' : ''} />{' '}
                        {scanning ? 'Matching available silhouettes…' : 'Ready when you are'}
                      </div>
                      <h3>{scanning ? 'Reading your styling canvas.' : 'A better starting point.'}</h3>
                      <p>
                        {scanning
                          ? 'Estimating proportions · selecting fit ranges · checking live floor stock'
                          : 'Caelus uses your image only to offer a helpful, editable fit estimate.'}
                      </p>
                      <button
                        className="button primary full"
                        disabled={scanning}
                        onClick={startAnalysis}
                      >
                        {scanning ? 'Creating fit profile…' : 'Analyse my fit'} <ArrowRight size={16} />
                      </button>
                      {!demoMode && (
                        <button className="text-button" onClick={runDemo}>
                          or load a demo profile
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="ready-badge">
                        <Check size={16} /> AI fit estimate ready
                      </div>
                      <h3>Set your starting point.</h3>
                      <p className="disclaimer">
                        A transparent prototype estimate — please adjust your size before we style.
                      </p>
                      <div className="fit-facts">
                        <div>
                          <span>APPROX. HEIGHT</span>
                          <strong>{fit.height}</strong>
                        </div>
                        <div>
                          <span>SHOULDER PROFILE</span>
                          <strong>{fit.shoulders}</strong>
                        </div>
                        <div>
                          <span>PROPORTIONS</span>
                          <strong>{fit.proportions}</strong>
                        </div>
                        <label>
                          <span>ESTIMATED SIZE</span>
                          <select
                            value={fit.size}
                            onChange={(event) => setFit({ ...fit, size: event.target.value })}
                            aria-label="Select estimated clothing size"
                          >
                            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                              <option key={size}>{size}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <button className="button primary full" onClick={() => go('chat')}>
                        Style my profile <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {screen === 'chat' && (
            <motion.section
              key="chat"
              className="page chat-page page-enter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="section-heading compact">
                <p className="eyebrow">
                  <span className="live-dot" /> {liveStylist ? 'LIVE AI STYLIST' : 'CAELUS STYLIST CONCIERGE'}
                </p>
                <h1>
                  Your style, <em>translated.</em>
                </h1>
                <p>Tell Caelus the plan. It will handle the route.</p>
              </div>

              <div className="chat-shell">
                <aside className="stylist-card">
                  <div className="stylist-orb">
                    <span>✦</span>
                  </div>
                  <div>
                    <p>YOUR AI STYLIST</p>
                    <strong>Caelus</strong>
                  </div>
                  <button
                    className="icon-button"
                    onClick={() => speak(messages.at(-1)?.text ?? '')}
                    aria-label="Read last stylist message aloud"
                  >
                    <Volume2 size={17} />
                  </button>
                  <small>
                    Fit profile: <b>{fit.size} · {fit.preference}</b>
                  </small>
                </aside>

                <div className="chat-panel">
                  <div className="message-list" role="log" aria-live="polite">
                    {messages.map((message, index) => (
                      <motion.div
                        key={`${message.text}-${index}`}
                        className={`message ${message.role}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {message.role === 'ai' && <span className="message-star">✦</span>}
                        <p>{message.text}</p>
                        {message.role === 'ai' && (
                          <button onClick={() => speak(message.text)} aria-label="Narrate message">
                            <Volume2 size={14} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {!occasion ? (
                    <div className="prompt-choices">
                      <p>SHOPPING FOR</p>
                      <div>
                        {occasions.map((option) => (
                          <button key={option} onClick={() => selectOccasion(option)}>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : !style ? (
                    <div className="prompt-choices">
                      <p>STYLE DIRECTION</p>
                      <div>
                        {styles.map((option) => (
                          <button key={option} onClick={() => selectStyle(option)}>
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="ready-to-style">
                      <span>
                        <Check size={15} /> {occasion}
                      </span>
                      <span>
                        <Check size={15} /> {style}
                      </span>
                      <button className="button primary" onClick={buildLooks}>
                        Create my 3 looks <Sparkles size={16} />
                      </button>
                    </div>
                  )}

                  <div className="chat-input">
                    <input
                      value={chatInput}
                      onChange={(event) => setChatInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') sendMessage();
                      }}
                      placeholder="Add styling notes — colours, budget, fits…"
                      aria-label="Styling message input"
                    />
                    <button
                      className={listening ? 'listening' : ''}
                      onClick={() => {
                        if (
                          !listen((text) =>
                            setChatInput((previous) => (previous ? `${previous} ${text}` : text))
                          )
                        ) {
                          flash('Voice input is not supported in this browser.');
                        }
                      }}
                      aria-label="Use voice input"
                    >
                      <Mic size={18} />
                    </button>
                    <button className="send" onClick={sendMessage} aria-label="Send message">
                      <Send size={17} />
                    </button>
                  </div>
                  {voiceSupported && (
                    <p className="voice-hint">
                      {listening ? 'Listening… speak naturally.' : 'Tap the mic to dictate style notes.'}
                    </p>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {screen === 'looks' && (
            <motion.section
              key="looks"
              className="page looks-page page-enter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="looks-top">
                <div>
                  <p className="eyebrow">
                    <Sparkles size={14} /> {currentOutfit?.confidence ?? 92}% style-match confidence{' '}
                    <small>· curated</small>
                  </p>
                  <h1>
                    Three ways to <em>arrive.</em>
                  </h1>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="button ghost small" onClick={requestFittingSuite}>
                    <DoorOpen size={14} /> Request Fitting Room
                  </button>
                  <button className="edit-link" onClick={() => go('saved')}>
                    <Heart size={17} fill={liked.length ? 'currentColor' : 'none'} /> My Edit{' '}
                    <b>{liked.length}</b>
                  </button>
                </div>
              </div>

              {currentOutfit && (
                <div className="look-layout">
                  <motion.div
                    className="look-visual"
                    key={currentOutfit.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="visual-orbit" />
                    <div className="visual-model">
                      <div className="model-head" />
                      <div className="model-top" />
                      <div className="model-bottom" />
                      <div className="model-shoe left" />
                      <div className="model-shoe right" />
                    </div>
                    <div className="look-number">
                      LOOK <b>0{activeLook + 1}</b>
                    </div>
                    <div className="visual-tag tag-one">{currentProducts[0]?.colour}</div>
                    <div className="visual-tag tag-two">IN STORE</div>
                    <div className="visual-caption">
                      <span>{currentOutfit.mood}</span>
                      <strong>{currentOutfit.title}</strong>
                    </div>
                  </motion.div>

                  <div className="look-info">
                    <div className="look-title-row">
                      <div>
                        <p className="eyebrow">CAELUS CURATION</p>
                        <h2>{currentOutfit.title}</h2>
                      </div>
                      <button
                        className={
                          liked.some((item) => item.id === currentOutfit.id)
                            ? 'heart-button liked'
                            : 'heart-button'
                        }
                        onClick={() => toggleLike(currentOutfit)}
                        aria-label="Save outfit to shortlist"
                      >
                        <Heart
                          size={20}
                          fill={liked.some((item) => item.id === currentOutfit.id) ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>

                    <div className="why">
                      <Sparkles size={18} />
                      <div>
                        <span>WHY CAELUS CHOSE THIS</span>
                        <p>{currentOutfit.explanation}</p>
                      </div>
                    </div>

                    <div className="look-products">
                      {currentProducts.map((product) => (
                        <ProductPill key={product.id} product={product} onRoute={setRouteProduct} />
                      ))}
                    </div>

                    <div className="total-route">
                      <div>
                        <span>COMPLETE LOOK</span>
                        <strong>{formatPrice(itemTotal(currentOutfit.itemIds))}</strong>
                      </div>
                      <button onClick={() => setRouteProduct(currentProducts[0])}>
                        <Navigation size={16} /> Walk to {currentOutfit.route.aisle} · {currentOutfit.route.shelf}
                      </button>
                    </div>

                    <div className="look-actions">
                      <button className="button pass" onClick={() => setFeedbackOpen(true)}>
                        <X size={17} /> Pass
                      </button>
                      <button
                        className="button ghost listen"
                        onClick={() =>
                          speak(`${currentOutfit.title}. ${generateStylingAdvice(currentOutfit)}`)
                        }
                      >
                        <Volume2 size={17} /> Listen
                      </button>
                      <button className="button primary" onClick={() => addLook(currentOutfit, true)}>
                        <ShoppingBag size={17} /> Add Look to Bag
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="look-pagination">
                <button
                  className="icon-button"
                  disabled={activeLook === 0}
                  onClick={() => setActiveLook((value) => value - 1)}
                  aria-label="Previous look"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  {looks.map((look, index) => (
                    <button
                      key={look.id}
                      className={index === activeLook ? 'active' : ''}
                      onClick={() => setActiveLook(index)}
                      aria-label={`View look ${index + 1}`}
                    />
                  ))}
                </div>
                <button
                  className="icon-button"
                  disabled={activeLook === looks.length - 1}
                  onClick={() => setActiveLook((value) => value + 1)}
                  aria-label="Next look"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.section>
          )}

          {screen === 'saved' && (
            <motion.section
              key="saved"
              className="page saved-page page-enter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="section-heading row-heading">
                <div>
                  <p className="eyebrow">
                    <Heart size={14} /> YOUR SHORTLIST
                  </p>
                  <h1>
                    My Caelus <em>Edit.</em>
                  </h1>
                  <p>Looks you loved, all mapped to this store’s floor.</p>
                </div>
                <button className="button ghost" onClick={() => go('looks')}>
                  <ArrowLeft size={16} /> Back to looks
                </button>
              </div>

              {liked.length === 0 ? (
                <div className="empty-state">
                  <Heart size={31} />
                  <h2>Your edit is waiting.</h2>
                  <p>Like a look and it will live here for the rest of your visit.</p>
                  <button className="button primary" onClick={() => go('looks')}>
                    See recommendations <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="saved-list">
                  {liked.map((outfit, index) => {
                    const products = outfit.itemIds
                      .map(productById)
                      .filter((product): product is Product => Boolean(product));
                    return (
                      <article className="saved-look" key={outfit.id}>
                        <div className="saved-visual">
                          <span>LOOK 0{index + 1}</span>
                          <div className="saved-orbit" />
                          <strong>{outfit.title}</strong>
                          <small>{outfit.mood}</small>
                        </div>
                        <div className="saved-content">
                          <div className="saved-head">
                            <div>
                              <p className="eyebrow">
                                {outfit.confidence}% MATCH <small>· curated</small>
                              </p>
                              <h2>{outfit.title}</h2>
                            </div>
                            <button
                              className="icon-button"
                              onClick={() => setLiked((items) => items.filter((item) => item.id !== outfit.id))}
                              aria-label="Remove saved look"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                          <div className="saved-products">
                            {products.map((product) => (
                              <ProductPill
                                key={product.id}
                                product={product}
                                onRoute={setRouteProduct}
                                selectable
                                selected={cart.some((line) => line.productId === product.id)}
                                onToggle={() => addItems([product.id])}
                              />
                            ))}
                          </div>
                          <footer>
                            <div>
                              <span>LOOK TOTAL</span>
                              <strong>{formatPrice(itemTotal(outfit.itemIds))}</strong>
                            </div>
                            <button className="button primary" onClick={() => addLook(outfit, true)}>
                              Add entire look <ShoppingBag size={16} />
                            </button>
                          </footer>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </motion.section>
          )}

          {screen === 'cart' && (
            <motion.section
              key="cart"
              className="page cart-page page-enter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="section-heading row-heading">
                <div>
                  <p className="eyebrow">
                    <ShoppingBag size={14} /> YOUR STORE BAG
                  </p>
                  <h1>
                    Ready when <em>you are.</em>
                  </h1>
                  <p>
                    {cartCount
                      ? `${cartCount} carefully chosen ${cartCount === 1 ? 'piece' : 'pieces'} in your bag.`
                      : 'Your bag is ready for a great look.'}
                  </p>
                </div>
                <button className="button ghost" onClick={() => go(liked.length ? 'saved' : 'looks')}>
                  <ArrowLeft size={16} /> Keep browsing
                </button>
              </div>

              {!cart.length ? (
                <div className="empty-state">
                  <ShoppingBag size={31} />
                  <h2>Your bag is beautifully empty.</h2>
                  <p>Add a complete Caelus look or select individual pieces.</p>
                  <button className="button primary" onClick={() => go(liked.length ? 'saved' : 'looks')}>
                    Find a look <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="cart-layout">
                  <div>
                    <div className="cart-lines">
                      {cartProducts.map(({ product, quantity }) => (
                        <article className="cart-line" key={product.id}>
                          <div className="cart-mark">{productIcon[product.category]}</div>
                          <div>
                            <p>{product.brand}</p>
                            <h3>{product.name}</h3>
                            <button
                              className="location-button"
                              onClick={() => setRouteProduct(product)}
                            >
                              <MapPin size={14} /> {product.aisle} · Shelf {product.shelf}
                            </button>
                          </div>
                          <div className="cart-price">
                            <strong>{formatPrice(product.price * quantity)}</strong>
                            <div className="quantity">
                              <button
                                onClick={() => updateCart(product.id, -1)}
                                aria-label={`Decrease quantity of ${product.name}`}
                              >
                                −
                              </button>
                              <span>{quantity}</span>
                              <button
                                onClick={() => updateCart(product.id, 1)}
                                aria-label={`Increase quantity of ${product.name}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <section className="complete-look">
                      <div>
                        <p className="eyebrow">
                          <Sparkles size={14} /> CAELUS FINISHING TOUCHES
                        </p>
                        <h2>Complete the look?</h2>
                        <p>
                          You already have the foundation. These are the coordinating accents that make it feel intentional.
                        </p>
                      </div>
                      <div className="accessory-grid">
                        {accessoryIdeas.map((product) => (
                          <button key={product.id} onClick={() => addItems([product.id])}>
                            <span>{productIcon[product.category]}</span>
                            <div>
                              <strong>{product.name}</strong>
                              <small>
                                {formatPrice(product.price)} · {product.aisle}
                              </small>
                            </div>
                            <Plus size={17} />
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>

                  <aside className="order-card">
                    <p className="eyebrow">ORDER SUMMARY</p>
                    <div>
                      <span>Subtotal</span>
                      <strong>{formatPrice(subtotal)}</strong>
                    </div>
                    <div>
                      <span>In-store styling credit</span>
                      <strong className="discount">−{formatPrice(discount)}</strong>
                    </div>
                    <div>
                      <span>Estimated taxes (5%)</span>
                      <strong>{formatPrice(tax)}</strong>
                    </div>
                    <hr />
                    <div className="grand-total">
                      <span>Total</span>
                      <strong>{formatPrice(total)}</strong>
                    </div>
                    <small>Taxes and promotions are calculated for this in-store retail session.</small>
                    <button className="button primary full" onClick={() => go('checkout')}>
                      Proceed to Checkout <ArrowRight size={16} />
                    </button>
                  </aside>
                </div>
              )}
            </motion.section>
          )}

          {screen === 'checkout' && (
            <motion.section
              key="checkout"
              className="page checkout-page page-enter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="section-heading compact">
                <p className="eyebrow">
                  <CreditCard size={14} /> RETAIL CHECKOUT
                </p>
                <h1>
                  One final <em>tap.</em>
                </h1>
                <p>Choose your preferred payment method or pay at the styling desk.</p>
              </div>

              <div className="checkout-layout">
                <section className="payment-card">
                  <div className="secure-row">
                    <span>
                      <Check size={15} /> 256-bit encrypted checkout
                    </span>
                    <span>ORDER · VC-24091</span>
                  </div>
                  <h2>Choose payment method</h2>
                  <div className="payment-methods">
                    {['UPI', 'Card', 'Cash at Counter'].map((method) => (
                      <button
                        className={paymentMethod === method ? 'selected' : ''}
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                      >
                        <span>{method === 'UPI' ? '₹' : method === 'Card' ? '▭' : '◎'}</span>
                        <div>
                          <strong>{method}</strong>
                          <small>
                            {method === 'UPI'
                              ? 'Instant UPI transfer'
                              : method === 'Card'
                              ? 'Credit or Debit card'
                              : 'Pay when you collect from stylist'}
                          </small>
                        </div>
                        <i />
                      </button>
                    ))}
                  </div>

                  <div className="demo-payment">
                    <span>RETAIL SUMMARY</span>
                    <p>
                      {paymentMethod === 'Cash at Counter'
                        ? 'Reserve the look — pay at the styling counter when trying on.'
                        : `Instant confirmation via ${paymentMethod}. Your pieces will be bagged at the counter.`}
                    </p>
                  </div>

                  <button
                    className="button primary full"
                    onClick={completePayment}
                    disabled={paying}
                  >
                    {paying ? 'Processing your order…' : `Pay ${formatPrice(total)}`} <ArrowRight size={16} />
                  </button>
                  <button className="text-button" onClick={() => go('cart')}>
                    Return to bag
                  </button>
                </section>

                <aside className="mini-summary">
                  <p className="eyebrow">YOUR SELECTION</p>
                  {cartProducts.slice(0, 4).map(({ product, quantity }) => (
                    <div key={product.id}>
                      <span>
                        {product.name} <small>×{quantity}</small>
                      </span>
                      <strong>{formatPrice(product.price * quantity)}</strong>
                    </div>
                  ))}
                  {cartProducts.length > 4 && <p>+ {cartProducts.length - 4} more pieces</p>}
                  <hr />
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{formatPrice(total)}</strong>
                  </div>
                </aside>
              </div>
            </motion.section>
          )}

          {screen === 'thanks' && (
            <motion.section
              key="thanks"
              className="thanks page-enter"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="celebration">
                <i />
                <i />
                <i />
                <i />
                <span>✦</span>
              </div>
              <img src="/vortex-logo.jpg" className="thanks-logo" alt="Vortex Caelus" width="140" height="70" />
              <p className="eyebrow">
                <Check size={14} /> ORDER CONFIRMED
              </p>
              <h1>
                Your look is
                <br />
                <em>officially yours.</em>
              </h1>
              <p>Thank you for styling with Caelus. Your collection is being prepped at the Styling Desk.</p>

              <div className="thanks-order">
                <div>
                  <span>ORDER NUMBER</span>
                  <strong>VC-24091</strong>
                </div>
                <div>
                  <span>COLLECTION POINT</span>
                  <strong>Stylist Desk · Fitting Suite 02</strong>
                </div>
                <div>
                  <span>TOTAL PAID</span>
                  <strong>{formatPrice(orderValue)}</strong>
                </div>
              </div>

              <div className="thank-actions">
                <button className="button primary" onClick={() => go('chat')}>
                  Style another look <Sparkles size={16} />
                </button>
                <button className="button ghost" onClick={resetJourney}>
                  Return to Home
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* In-store interactive map navigation */}
      <AnimatePresence>
        {routeProduct && <StoreRoute product={routeProduct} onClose={() => setRouteProduct(null)} />}
      </AnimatePresence>

      {/* Live Webcam & Camera Capture Modal */}
      <AnimatePresence>
        {cameraModalOpen && (
          <CameraCaptureModal
            onCapture={handleCameraCapture}
            onClose={() => setCameraModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Retail Stylist & Associate CRM Modal */}
      <AnimatePresence>
        {crmOpen && (
          <CrmPortal
            currentCustomerFit={fit}
            currentBagCount={cartCount}
            onSelectCustomerForStyling={handleSelectCustomerFromCrm}
            onClose={() => setCrmOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Feedback pass look modal */}
      <AnimatePresence>
        {feedbackOpen && (
          <motion.div
            className="feedback-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFeedbackOpen(false)}
            role="dialog"
            aria-label="Styling feedback"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="icon-button modal-close"
                onClick={() => setFeedbackOpen(false)}
                aria-label="Close feedback"
              >
                <X size={17} />
              </button>
              <p className="eyebrow">HELP CAELUS LEARN</p>
              <h3>What missed the mark?</h3>
              <p>Your answer reshapes the remaining recommendations in real time.</p>
              {['Too expensive', 'Not my style', "Don't like the colour", "Doesn't fit", 'Other'].map(
                (reason) => (
                  <button key={reason} onClick={() => passLook(reason)}>
                    {reason}
                    <ArrowRight size={15} />
                  </button>
                )
              )}
              <button className="text-button" onClick={() => passLook()}>
                Skip without feedback
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast Feedback */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            role="status"
            aria-live="polite"
          >
            <Check size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
