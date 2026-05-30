"use client";

import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { Dialog, DialogContent } from "@calcom/ui/components/dialog";
import { Button } from "@calcom/ui/components/button";
import { Icon } from "@calcom/ui/components/icon";
import { useCallback, useState } from "react";
import { BookerWebWrapper } from "./BookerWebWrapper";

interface NewBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type EventTypeGroup = RouterOutputs["viewer"]["eventTypes"]["getByViewer"]["eventTypeGroups"][number];
type EventType = EventTypeGroup["eventTypes"][number];

export function NewBookingDialog({ isOpen, onClose }: NewBookingDialogProps) {
  const me = useMeQuery().data;
  const utils = trpc.useUtils();
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [bookedUid, setBookedUid] = useState<string | null>(null);

  const { data: eventTypesData, isPending } = trpc.viewer.eventTypes.getByViewer.useQuery(
    {},
    { enabled: isOpen }
  );

  const personalGroup = eventTypesData?.eventTypeGroups?.find((g: EventTypeGroup) => !g.teamId);
  const eventTypes: EventType[] = personalGroup?.eventTypes ?? [];

  const handleClose = useCallback(() => {
    if (bookedUid) utils.viewer.bookings.get.invalidate();
    setSelectedEvent(null);
    setBookedUid(null);
    onClose();
  }, [onClose, utils, bookedUid]);

  const handleBookingSuccess = useCallback((uid: string) => {
    setBookedUid(uid);
  }, []);

  const username = me?.username ?? "";
  const step = bookedUid ? "success" : selectedEvent ? "booker" : "picker";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        // biome-ignore lint: bypass creation wrapper to control layout ourselves
        type={undefined as unknown as "creation"}
        size="lg"
        className="overflow-hidden !p-0 min-h-[90vh] flex flex-col"
        enableOverflow>

        {/* Picker step */}
        {step === "picker" && (
          <div className="px-6 py-6">
            <h2 className="text-emphasis text-lg font-semibold mb-1">New Booking</h2>
            <p className="text-subtle text-sm mb-4">Select an event type to schedule</p>
            {isPending && <p className="text-subtle text-sm">Loading...</p>}
            <div className="space-y-2">
              {eventTypes.map((et: EventType) => (
                <button
                  key={et.id}
                  onClick={() => setSelectedEvent(et)}
                  className="w-full text-left p-4 rounded-lg border border-subtle hover:border-emphasis hover:bg-subtle transition-colors flex items-center justify-between group">
                  <div>
                    <p className="text-emphasis font-medium text-sm">{et.title}</p>
                    {et.description && (
                      <p className="text-subtle text-xs mt-0.5 line-clamp-1">{et.description}</p>
                    )}
                  </div>
                  <Icon
                    name="arrow-right"
                    className="text-subtle h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
              {!isPending && eventTypes.length === 0 && (
                <p className="text-subtle text-sm">No event types found.</p>
              )}
            </div>
          </div>
        )}

        {/* Booker step */}
        {step === "booker" && selectedEvent && username && (
          <div>
            <div
              className="flex items-center justify-between px-4 border-b border-subtle bg-default"
              style={{ height: "49px" }}>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-subtle hover:text-emphasis text-sm flex items-center gap-1">
                <Icon name="arrow-left" className="h-3 w-3" />
                Back
              </button>
            </div>
            <div className="overflow-y-auto py-3" style={{ maxHeight: "calc(90vh - 49px)" }}>
              <BookerWebWrapper
                username={username}
                eventSlug={selectedEvent.slug}
                entity={{ fromRedirectOfNonOrgLink: false, considerUnpublished: false }}
                hideBranding
                onBookingSuccess={handleBookingSuccess}
                hideHeader
                customClassNames={{ bookerWrapper: "!my-0", bookerContainer: "!h-[calc(90vh-49px-1.5rem)] !max-h-[calc(90vh-49px-1.5rem)]" }}
              />
            </div>
          </div>
        )}

        {/* Success step */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Icon name="check" className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-emphasis text-xl font-semibold mb-2">Booking confirmed</h2>
            <p className="text-subtle text-sm mb-6">The booking has been created successfully.</p>
            <Button color="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
