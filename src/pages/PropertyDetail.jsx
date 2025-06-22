import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiCall, getImageUrls } from '../services/api';
import Layout from '../components/Layout';
import { ArrowLeft, Heart, X, Loader2 } from 'lucide-react';
import ImageLightbox from '../components/ImageLightbox';

const PropertyDetail = () => {
    const { propertyId } = useParams();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [swipeLoading, setSwipeLoading] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const defaultImages = [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&crop=entropy&auto=format&q=80",
    ];

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await apiCall(`/properties/${propertyId}`);
                setProperty(response);
            } catch (err) {
                setError('Failed to fetch property details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProperty();
    }, [propertyId]);

    const handleSwipe = async (isLike) => {
        if (swipeLoading) return;
        setSwipeLoading(true);
        try {
            await apiCall(`/swipe/${propertyId}`, {
                method: 'POST',
                body: JSON.stringify({ is_like: isLike }),
            });
            // Maybe show a success message or navigate away
            alert(isLike ? 'You liked this property!' : 'You passed on this property.');
        } catch (err) {
            setError("Failed to record swipe. Please try again.");
        } finally {
            setSwipeLoading(false);
        }
    };

    const getPropertyImages = () => {
        if (property && property.images && property.images.length > 0) {
            return getImageUrls(property.images);
        }
        return defaultImages;
    };

    const openLightbox = (index) => {
        setSelectedImageIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const goToNextImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex + 1) % getPropertyImages().length);
    };

    const goToPrevImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex - 1 + getPropertyImages().length) % getPropertyImages().length);
    };

    if (loading) {
        return <Layout><div className="text-center p-8">Loading...</div></Layout>;
    }

    if (error) {
        return <Layout><div className="text-center p-8 text-red-500">{error}</div></Layout>;
    }

    if (!property) {
        return <Layout><div className="text-center p-8">Property not found.</div></Layout>;
    }

    return (
        <Layout>
            <div className="container mx-auto p-4">
                <Link to="/dashboard" className="inline-flex items-center mb-4 text-teal-600 hover:underline">
                    <ArrowLeft className="mr-2" />
                    Back to Dashboard
                </Link>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-8">
                        <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
                        <p className="text-xl text-gray-600 mb-4">{property.city}, {property.state}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                                <p className="text-gray-700">{property.description}</p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Details</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    <li><span className="font-semibold">Price:</span> ${property.price}</li>
                                    <li><span className="font-semibold">Type:</span> {property.type}</li>
                                    <li><span className="font-semibold">Owner:</span> {property.user.name}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-semibold mb-4">Images</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {getPropertyImages().map((image, index) => (
                                    <img 
                                        key={index} 
                                        src={image} 
                                        alt={`Property image ${index + 1}`} 
                                        className="w-full h-auto rounded-lg shadow cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => openLightbox(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t flex justify-center items-center gap-8">
                            <button
                                onClick={() => handleSwipe(false)}
                                disabled={swipeLoading}
                                className="w-20 h-20 bg-white border-4 border-red-400 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                title="Pass on this property">
                                {swipeLoading ? (
                                <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                                ) : (
                                <X className="w-8 h-8 text-red-400" strokeWidth={3} />
                                )}
                            </button>
                            <button
                                onClick={() => handleSwipe(true)}
                                disabled={swipeLoading}
                                className="w-20 h-20 bg-white border-4 border-green-400 rounded-full flex items-center justify-center hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                title="Like this property">
                                {swipeLoading ? (
                                <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
                                ) : (
                                <Heart
                                    className="w-8 h-8 text-green-400"
                                    strokeWidth={3}
                                />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                 {isLightboxOpen && (
                    <ImageLightbox
                        images={getPropertyImages()}
                        selectedIndex={selectedImageIndex}
                        onClose={closeLightbox}
                        onNext={goToNextImage}
                        onPrev={goToPrevImage}
                    />
                )}
            </div>
        </Layout>
    );
};

export default PropertyDetail; 