import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  titlePl: string;
  titleEn: string;
  bodyPl?: string;
  bodyEn?: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        titlePl: params.titlePl,
        titleEn: params.titleEn,
        bodyPl: params.bodyPl || null,
        bodyEn: params.bodyEn || null,
        link: params.link || null,
      },
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

export async function notifyListingCreated(userId: string, listingId: string, listingTitle: string) {
  return createNotification({
    userId,
    type: 'LISTING_CREATED',
    titlePl: 'Ogloszenie dodane!',
    titleEn: 'Listing created!',
    bodyPl: `Twoje ogloszenie "${listingTitle}" zostalo pomyslnie opublikowane.`,
    bodyEn: `Your listing "${listingTitle}" has been successfully published.`,
    link: `/ogloszenia/${listingId}`,
  });
}

export async function notifyListingPromoted(userId: string, listingId: string, listingTitle: string, until: Date) {
  const dateStr = until.toLocaleDateString('pl-PL');
  return createNotification({
    userId,
    type: 'LISTING_PROMOTED',
    titlePl: 'Ogloszenie promowane!',
    titleEn: 'Listing promoted!',
    bodyPl: `Twoje ogloszenie "${listingTitle}" jest teraz promowane do ${dateStr}.`,
    bodyEn: `Your listing "${listingTitle}" is now promoted until ${dateStr}.`,
    link: `/ogloszenia/${listingId}`,
  });
}

export async function notifyPromotionExpiring(userId: string, listingId: string, listingTitle: string, daysLeft: number) {
  return createNotification({
    userId,
    type: 'PROMOTION_EXPIRING',
    titlePl: `Promocja wkrotce wygasnie`,
    titleEn: `Promotion expiring soon`,
    bodyPl: `Promocja ogloszenia "${listingTitle}" wygasnie za ${daysLeft} ${daysLeft === 1 ? 'dzien' : 'dni'}. Przedluz aby utrzymac widocznosc!`,
    bodyEn: `Promotion for "${listingTitle}" expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Renew to keep visibility!`,
    link: `/promuj/${listingId}`,
  });
}

export async function notifyPromotionExpired(userId: string, listingId: string, listingTitle: string) {
  return createNotification({
    userId,
    type: 'PROMOTION_EXPIRED',
    titlePl: 'Promocja wygasla',
    titleEn: 'Promotion expired',
    bodyPl: `Promocja ogloszenia "${listingTitle}" wygasla. Mozesz ja odnowic w kazdej chwili.`,
    bodyEn: `Promotion for "${listingTitle}" has expired. You can renew it anytime.`,
    link: `/promuj/${listingId}`,
  });
}

export async function notifyNewMessage(userId: string, senderName: string, conversationId: string) {
  return createNotification({
    userId,
    type: 'NEW_MESSAGE',
    titlePl: 'Nowa wiadomosc',
    titleEn: 'New message',
    bodyPl: `${senderName} wyslal(a) Ci wiadomosc.`,
    bodyEn: `${senderName} sent you a message.`,
    link: `/wiadomosci/${conversationId}`,
  });
}

export async function notifyNewReview(userId: string, reviewerName: string, rating: number) {
  return createNotification({
    userId,
    type: 'NEW_REVIEW',
    titlePl: 'Nowa opinia',
    titleEn: 'New review',
    bodyPl: `${reviewerName} wystawil(a) Ci ocene ${rating}/5.`,
    bodyEn: `${reviewerName} gave you a ${rating}/5 rating.`,
    link: `/uzytkownik/${userId}`,
  });
}

export async function notifyListingFavorited(userId: string, listingId: string, listingTitle: string) {
  return createNotification({
    userId,
    type: 'LISTING_FAVORITED',
    titlePl: 'Ktos polubil Twoje ogloszenie',
    titleEn: 'Someone liked your listing',
    bodyPl: `Ktos dodal "${listingTitle}" do ulubionych.`,
    bodyEn: `Someone added "${listingTitle}" to favorites.`,
    link: `/ogloszenia/${listingId}`,
  });
}

export async function notifySystem(userId: string, titlePl: string, titleEn: string, bodyPl?: string, bodyEn?: string, link?: string) {
  return createNotification({
    userId,
    type: 'SYSTEM',
    titlePl,
    titleEn,
    bodyPl,
    bodyEn,
    link,
  });
}
